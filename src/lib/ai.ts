import type { z } from "zod";
import { env, features } from "@/lib/env";

/**
 * The model calls this product makes.
 *
 * There is no provider SDK here on purpose. The `ai` package is not a
 * dependency and neither is `@ai-sdk/anthropic`: everything goes through the
 * Vercel AI Gateway's OpenAI-compatible endpoint with one key and one
 * "provider/model" string, so switching model is an env var rather than an
 * install.
 *
 * Two rules the whole file exists to keep:
 *
 *   1. Never throw at the caller. A model is a flaky dependency; a form that
 *      saves a row must not 500 because a summary did not come back. Every
 *      path returns a result object, and the caller decides what to show.
 *   2. Never log the key. Failures are logged with the status and a short
 *      message, both passed through `redact()` first.
 */

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_MAX_TOKENS = 1024;
const OBJECT_MAX_TOKENS = 2048;

export type AiFailureReason = "disabled" | "failed";

export type AiFailure = { ok: false; reason: AiFailureReason; message: string };

export type AiTextResult = { ok: true; value: string; degraded: boolean } | AiFailure;

export type AiObjectResult<T> = { ok: true; object: T; degraded: boolean } | AiFailure;

export type GenerateTextInput = {
  /** Who the model is and what the rules are. Never user input. */
  system: string;
  /** The task. Wrap anything a user typed in this, never in `system`. */
  prompt: string;
  /** A "provider/model" string. Defaults to `AI_MODEL`. */
  model?: string;
  /** Defaults to `AI_TIMEOUT_MS`. */
  timeoutMs?: number;
  maxTokens?: number;
};

export type GenerateObjectInput<T> = {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  model?: string;
  timeoutMs?: number;
};

/** Message the caller can show when AI is switched off. */
const DISABLED_MESSAGE = "AI is not configured on this deployment.";

/** Strip the gateway key out of anything on its way to a log or a caller. */
function redact(value: string): string {
  const key = env.AI_GATEWAY_API_KEY;
  if (key.length < 8) return value;
  return value.split(key).join("[redacted]");
}

function failed(message: string): AiFailure {
  return { ok: false, reason: "failed", message: redact(message) };
}

function disabled(): AiFailure {
  return { ok: false, reason: "disabled", message: DISABLED_MESSAGE };
}

type Completion = {
  /** The assistant's text, already trimmed. */
  text: string;
  /** True when the model stopped because it ran out of tokens. */
  truncated: boolean;
};

type GatewayChoice = {
  message?: { content?: unknown };
  finish_reason?: unknown;
};

/** Pull the text out of an OpenAI-shaped response without trusting its shape. */
function readCompletion(payload: unknown): Completion | null {
  if (typeof payload !== "object" || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const first = choices[0] as GatewayChoice | undefined;
  const content = first?.message?.content;
  if (typeof content !== "string") return null;

  const text = content.trim();
  if (text.length === 0) return null;
  return { text, truncated: first?.finish_reason === "length" };
}

/**
 * The first balanced JSON object or array in a string, fences and chatter
 * stripped. Models add "Here you go:" and ```json far more often than they
 * return bare JSON, and one retry costs a second of a member's life.
 */
export function extractJson(text: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = (fenced?.[1] ?? text).trim();

  const start = body.search(/[[{]/);
  if (start === -1) return null;

  const open = body[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < body.length; i += 1) {
    const char = body[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return body.slice(start, i + 1);
    }
  }
  return null;
}

type CallInput = {
  system: string;
  prompt: string;
  model: string;
  timeoutMs: number;
  maxTokens: number;
};

type CallResult = { ok: true; completion: Completion } | { ok: false; message: string };

/** One request to the gateway. Resolves, always. */
async function call(input: CallInput): Promise<CallResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, input.timeoutMs);

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // The body can echo the request, so it never reaches a log unredacted.
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        message: `gateway returned ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      };
    }

    const completion = readCompletion(await response.json());
    if (!completion) return { ok: false, message: "gateway returned no usable text" };
    return { ok: true, completion };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    if (aborted) return { ok: false, message: `timed out after ${input.timeoutMs}ms` };
    return { ok: false, message: error instanceof Error ? error.message : "request failed" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Plain text from the model.
 *
 * `degraded: true` means the answer is usable but was cut short by the token
 * limit, so a caller can say "this is partial" instead of pretending.
 */
export async function generateTextSafe(input: GenerateTextInput): Promise<AiTextResult> {
  if (!features.ai) return disabled();

  const result = await call({
    system: input.system,
    prompt: input.prompt,
    model: input.model ?? env.AI_MODEL,
    timeoutMs: input.timeoutMs ?? env.AI_TIMEOUT_MS,
    maxTokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
  });

  if (!result.ok) {
    console.error(`[ai] text generation failed - ${redact(result.message)}`);
    return failed(result.message);
  }
  return { ok: true, value: result.completion.text, degraded: result.completion.truncated };
}

const JSON_RULES =
  "Reply with one JSON value and nothing else. No prose before it, no prose after it, " +
  "no markdown fence. Use only the fields the task asks for.";

/**
 * A validated object from the model.
 *
 * The model is asked for JSON, the first JSON value in the reply is parsed and
 * then checked against `schema`. Anything that fails - transport, parse or
 * schema - is retried once against `AI_MODEL_FALLBACK`, and a result that only
 * the fallback produced comes back with `degraded: true`.
 */
export async function generateObjectSafe<T>(
  input: GenerateObjectInput<T>,
): Promise<AiObjectResult<T>> {
  if (!features.ai) return disabled();

  const primary = input.model ?? env.AI_MODEL;
  const fallback = env.AI_MODEL_FALLBACK.trim();
  const models = fallback && fallback !== primary ? [primary, fallback] : [primary];
  const timeoutMs = input.timeoutMs ?? env.AI_TIMEOUT_MS;

  let lastMessage = "no attempt was made";

  for (const [index, model] of models.entries()) {
    const result = await call({
      system: `${input.system}\n\n${JSON_RULES}`,
      prompt: input.prompt,
      model,
      timeoutMs,
      maxTokens: OBJECT_MAX_TOKENS,
    });

    if (!result.ok) {
      lastMessage = result.message;
      continue;
    }

    const json = extractJson(result.completion.text);
    if (!json) {
      lastMessage = "model did not return JSON";
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      lastMessage = "model returned JSON that does not parse";
      continue;
    }

    const checked = input.schema.safeParse(parsed);
    if (!checked.success) {
      lastMessage = `model returned JSON that does not match the schema: ${checked.error.issues[0]?.message ?? "unknown issue"}`;
      continue;
    }

    return { ok: true, object: checked.data, degraded: index > 0 };
  }

  console.error(`[ai] object generation failed - ${redact(lastMessage)}`);
  return failed(lastMessage);
}
