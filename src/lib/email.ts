import { Resend } from "resend";
import { env, features } from "@/lib/env";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  skipped: boolean;
  id?: string;
  error?: string;
};

let client: Resend | null = null;

/**
 * Transactional email. Without RESEND_API_KEY it logs what it would have sent
 * and reports success, so local development and credential-free previews never
 * fail a user flow on a missing provider.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!features.resend) {
    console.info(
      `[email] RESEND_API_KEY is not set - not sending "${input.subject}" to ${String(input.to)}`,
    );
    return { ok: true, skipped: true };
  }

  client ??= new Resend(env.RESEND_API_KEY);
  const { data, error } = await client.emails.send({
    from: env.RESEND_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
  });

  if (error) {
    console.error("[email] send failed", error);
    return { ok: false, skipped: false, error: error.message };
  }
  return { ok: true, skipped: false, ...(data?.id ? { id: data.id } : {}) };
}
