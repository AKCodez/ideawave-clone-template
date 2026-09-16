import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

/** A value that must never reach a log, a caller, or a returned message. */
const KEY = "sk-gateway-never-log-this";

type AiModule = typeof import("@/lib/ai");

/** Re-imports src/lib/ai with a fresh src/lib/env, which reads process.env once. */
async function loadAi(vars: Record<string, string>): Promise<AiModule> {
  vi.resetModules();
  for (const [name, value] of Object.entries(vars)) vi.stubEnv(name, value);
  return import("@/lib/ai");
}

function completion(content: string, finishReason = "stop"): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content }, finish_reason: finishReason }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

type SentRequest = { url: string; headers: Record<string, string>; body: Record<string, unknown> };

/** Records what was sent and replays the queued responses in order. */
function stubFetch(responses: Response[]): SentRequest[] {
  const sent: SentRequest[] = [];
  let index = 0;

  vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>;
    sent.push({
      url: String(url),
      headers,
      body: JSON.parse(String(init.body)) as Record<string, unknown>,
    });
    const next = responses[Math.min(index, responses.length - 1)];
    index += 1;
    return Promise.resolve(next ?? completion("{}"));
  });

  return sent;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("extractJson", () => {
  it("reads a bare object", async () => {
    const { extractJson } = await loadAi({});
    expect(extractJson('{"a":1}')).toBe('{"a":1}');
  });

  it("reads through a fence and the chatter around it", async () => {
    const { extractJson } = await loadAi({});
    expect(extractJson('Sure thing:\n```json\n{"a": 1}\n```\nHope that helps.')).toBe('{"a": 1}');
  });

  it("stops at the matching brace, braces inside strings included", async () => {
    const { extractJson } = await loadAi({});
    expect(extractJson('{"a":"}"}  trailing')).toBe('{"a":"}"}');
  });

  it("reads an array", async () => {
    const { extractJson } = await loadAi({});
    expect(extractJson("here: [1, 2]")).toBe("[1, 2]");
  });

  it("returns null when there is no JSON at all", async () => {
    const { extractJson } = await loadAi({});
    expect(extractJson("I cannot help with that.")).toBeNull();
  });
});

describe("generateTextSafe", () => {
  it("is disabled, not failed, without a gateway key", async () => {
    const { generateTextSafe } = await loadAi({ AI_GATEWAY_API_KEY: "" });
    const result = await generateTextSafe({ system: "s", prompt: "p" });

    expect(result).toEqual({
      ok: false,
      reason: "disabled",
      message: expect.stringContaining("not configured"),
    });
  });

  it("sends the key as a bearer token and returns the text", async () => {
    const { generateTextSafe } = await loadAi({
      AI_GATEWAY_API_KEY: KEY,
      AI_MODEL: "anthropic/claude-sonnet-5",
    });
    const sent = stubFetch([completion("  Two warehouses, one spreadsheet.  ")]);

    const result = await generateTextSafe({ system: "s", prompt: "p" });

    expect(result).toEqual({ ok: true, value: "Two warehouses, one spreadsheet.", degraded: false });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.url).toBe("https://ai-gateway.vercel.sh/v1/chat/completions");
    expect(sent[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(sent[0]?.body.model).toBe("anthropic/claude-sonnet-5");
  });

  it("marks a completion the model ran out of room for as degraded", async () => {
    const { generateTextSafe } = await loadAi({ AI_GATEWAY_API_KEY: KEY });
    stubFetch([completion("half a sen", "length")]);

    const result = await generateTextSafe({ system: "s", prompt: "p" });

    expect(result).toEqual({ ok: true, value: "half a sen", degraded: true });
  });

  it("never returns the key, even when the gateway echoes it back", async () => {
    const { generateTextSafe } = await loadAi({ AI_GATEWAY_API_KEY: KEY });
    stubFetch([new Response(`bad token ${KEY}`, { status: 401 })]);

    const result = await generateTextSafe({ system: "s", prompt: "p" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("failed");
    expect(result.message).not.toContain(KEY);
    expect(result.message).toContain("[redacted]");
  });

  it("times out instead of hanging", async () => {
    const { generateTextSafe } = await loadAi({ AI_GATEWAY_API_KEY: KEY });
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        });
      });
    });

    const result = await generateTextSafe({ system: "s", prompt: "p", timeoutMs: 10 });

    expect(result).toEqual({
      ok: false,
      reason: "failed",
      message: expect.stringContaining("timed out"),
    });
  });
});

describe("generateObjectSafe", () => {
  const schema = z.object({ title: z.string(), tags: z.array(z.string()) });

  it("validates the object it parsed", async () => {
    const { generateObjectSafe } = await loadAi({ AI_GATEWAY_API_KEY: KEY });
    stubFetch([completion('```json\n{"title":"Exports","tags":["support"]}\n```')]);

    const result = await generateObjectSafe({ schema, system: "s", prompt: "p" });

    expect(result).toEqual({
      ok: true,
      object: { title: "Exports", tags: ["support"] },
      degraded: false,
    });
  });

  it("retries once on the fallback model and says the result is degraded", async () => {
    const { generateObjectSafe } = await loadAi({
      AI_GATEWAY_API_KEY: KEY,
      AI_MODEL: "anthropic/claude-sonnet-5",
      AI_MODEL_FALLBACK: "openai/gpt-5-mini",
    });
    const sent = stubFetch([
      completion("I am afraid I cannot do that."),
      completion('{"title":"Exports","tags":[]}'),
    ]);

    const result = await generateObjectSafe({ schema, system: "s", prompt: "p" });

    expect(result).toEqual({ ok: true, object: { title: "Exports", tags: [] }, degraded: true });
    expect(sent.map((request) => request.body.model)).toEqual([
      "anthropic/claude-sonnet-5",
      "openai/gpt-5-mini",
    ]);
  });

  it("retries when the JSON parses but misses the schema, then gives up", async () => {
    const { generateObjectSafe } = await loadAi({
      AI_GATEWAY_API_KEY: KEY,
      AI_MODEL: "a/one",
      AI_MODEL_FALLBACK: "b/two",
    });
    const sent = stubFetch([completion('{"title":42}'), completion('{"title":7}')]);

    const result = await generateObjectSafe({ schema, system: "s", prompt: "p" });

    expect(sent).toHaveLength(2);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("failed");
    expect(result.message).toContain("schema");
  });

  it("does not call the same model twice when there is no distinct fallback", async () => {
    const { generateObjectSafe } = await loadAi({
      AI_GATEWAY_API_KEY: KEY,
      AI_MODEL: "a/one",
      AI_MODEL_FALLBACK: "a/one",
    });
    const sent = stubFetch([completion("not json")]);

    const result = await generateObjectSafe({ schema, system: "s", prompt: "p" });

    expect(sent).toHaveLength(1);
    expect(result.ok).toBe(false);
  });

  it("is disabled, not failed, without a gateway key", async () => {
    const { generateObjectSafe } = await loadAi({ AI_GATEWAY_API_KEY: "" });
    const result = await generateObjectSafe({ schema, system: "s", prompt: "p" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("disabled");
  });
});
