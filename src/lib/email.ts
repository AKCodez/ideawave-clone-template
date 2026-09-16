import { Resend } from "resend";
import { tokens } from "@/design/tokens";
import { FONT_META } from "@/design/types";
import { appName, appUrl, env, features } from "@/lib/env";

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
 * `Dana Okafor <hello@example.com>` - the From header a person recognises.
 *
 * `RESEND_FROM` is usually a bare address, so the brand's display name is
 * added here. A value that already carries a display name is passed through
 * untouched, because whoever wrote it meant it.
 */
export function fromHeader(): string {
  const raw = env.RESEND_FROM.trim();
  if (raw.length === 0 || raw.includes("<")) return raw;

  const safeName = /^[A-Za-z0-9 .'-]+$/.test(appName) ? appName : `"${appName.replace(/"/g, "")}"`;
  return `${safeName} <${raw}>`;
}

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
    from: fromHeader(),
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

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

export type EmailCta = { label: string; url: string };

export type RenderEmailInput = {
  /** One line. It is the first thing read, and often the only thing read. */
  heading: string;
  /** One idea per paragraph, in the order they matter. */
  paragraphs: string[];
  /** At most one. An email with two buttons has no button. */
  cta?: EmailCta;
  /** Replaces the default sign-off line. */
  footer?: string;
};

export type RenderedEmail = { html: string; text: string };

/**
 * Inbox clients strip `<style>`, ignore custom properties and cannot be
 * trusted with flexbox, so this is a table with inline styles and nothing
 * else - and it is drawn on the LIGHT ramp whatever the app's own scheme is,
 * because a dark email in a light inbox reads as a phishing attempt.
 */
const ramp = tokens.schemes.light.hex;

/* Single quotes on purpose: these strings live inside a double-quoted `style`
   attribute, and a double quote in there closes the attribute. */
const BODY_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const DISPLAY_FONT =
  FONT_META[tokens.fonts.keys.display].class === "serif"
    ? "Georgia, 'Times New Roman', serif"
    : BODY_FONT;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MONOGRAM_RADIUS: Record<string, string> = {
  circle: "999px",
  rounded: "8px",
  square: "0",
  hexagon: "8px",
};

function wordmarkHtml(): string {
  const { monogram, case: casing, weight } = tokens.brand.wordmark;
  const label =
    casing === "lower" ? appName.toLowerCase() : casing === "upper" ? appName.toUpperCase() : appName;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="width:36px;height:36px;background:${ramp.accent};border-radius:${MONOGRAM_RADIUS[monogram.shape] ?? "8px"};color:${ramp["on-accent"]};font-family:${DISPLAY_FONT};font-size:15px;font-weight:${weight};text-align:center;vertical-align:middle;">${escapeHtml(monogram.letters)}</td>
      <td style="padding-left:12px;font-family:${DISPLAY_FONT};font-size:19px;font-weight:${weight};color:${ramp.ink};vertical-align:middle;">${escapeHtml(label)}</td>
    </tr></table>`;
}

function ctaHtml(cta: EmailCta): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>
      <td style="background:${ramp.accent};border-radius:6px;">
        <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 22px;font-family:${BODY_FONT};font-size:15px;font-weight:600;color:${ramp["on-accent"]};text-decoration:none;">${escapeHtml(cta.label)}</a>
      </td>
    </tr></table>`;
}

/**
 * One transactional email, as HTML and as the plain-text alternative that
 * actually says the same thing. Both come from the same input, so they cannot
 * drift apart.
 */
export function renderEmail(input: RenderEmailInput): RenderedEmail {
  const footer = input.footer ?? `Sent by ${appName}. ${appUrl}`;

  const paragraphs = input.paragraphs
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${ramp.ink};">${escapeHtml(line)}</p>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${ramp.canvas};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ramp.canvas};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <tr><td style="padding-bottom:20px;">${wordmarkHtml()}</td></tr>
      <tr><td style="background:${ramp.surface};border:1px solid ${ramp.line};border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 18px;font-family:${DISPLAY_FONT};font-size:24px;line-height:1.25;font-weight:600;color:${ramp.ink};">${escapeHtml(input.heading)}</h1>
        ${paragraphs}${input.cta ? ctaHtml(input.cta) : ""}
      </td></tr>
      <tr><td style="padding:20px 4px 0;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${ramp.faint};">${escapeHtml(footer)}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const text = [
    appName,
    "",
    input.heading,
    "",
    ...input.paragraphs.flatMap((line) => [line, ""]),
    ...(input.cta ? [`${input.cta.label}: ${input.cta.url}`, ""] : []),
    footer,
    "",
  ].join("\n");

  return { html, text };
}

export type RenderedTransactionalEmail = RenderedEmail & { subject: string };

/**
 * The reset mail, ready to hand to `sendEmail`.
 *
 * Wire it in `src/lib/auth.ts`:
 *
 * ```ts
 * sendResetPassword: async ({ user, url }) => {
 *   const { subject, html, text } = renderPasswordResetEmail(url);
 *   await sendEmail({ to: user.email, subject, html, text });
 * },
 * ```
 */
export function renderPasswordResetEmail(url: string): RenderedTransactionalEmail {
  const subject = `Reset your ${appName} password`;
  const { html, text } = renderEmail({
    heading: "Choose a new password",
    paragraphs: [
      `Someone asked to reset the password for your ${appName} account.`,
      "The link below works once and expires in an hour.",
      "If that was not you, ignore this email. Nothing changes until the link is used.",
    ],
    cta: { label: "Choose a new password", url },
    footer: `Sent by ${appName}. If the button does not work, paste this into your browser: ${url}`,
  });
  return { subject, html, text };
}
