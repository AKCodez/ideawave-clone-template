import { z } from "zod";
import brand from "@/brand";

/**
 * The single reader of process.env. Nothing else in the app touches it.
 *
 * Every key is optional and defaults to "" so that `next build` succeeds on a
 * machine with no secrets at all (the clone sandbox builds before any database
 * exists). Missing credentials flip a capability flag off, and the feature that
 * needs them degrades with an honest message instead of crashing.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database (Neon Postgres)
  DATABASE_URL: z.string().default(""),
  DIRECT_URL: z.string().default(""),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().default(""),
  BETTER_AUTH_URL: z.string().default(""),
  NEXT_PUBLIC_APP_URL: z.string().default(""),

  // Identity. The brand file is the fallback for both, so an unset deployment
  // still calls itself the right thing.
  APP_NAME: z.string().default(""),
  APP_URL: z.string().default(""),
  DEMO_MODE: z.string().default(""),

  // AI, through the Vercel AI Gateway. One key, "provider/model" strings.
  AI_GATEWAY_API_KEY: z.string().default(""),
  AI_MODEL: z.string().default("anthropic/claude-sonnet-5"),
  AI_MODEL_FALLBACK: z.string().default("openai/gpt-5-mini"),
  AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).catch(30000),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PRICE_ID: z.string().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),

  // Resend (optional)
  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM: z.string().default("onboarding@resend.dev"),

  // Injected by Vercel
  VERCEL_URL: z.string().default(""),
});

export type Env = z.infer<typeof schema>;

function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();

/** Public origin of this deployment. */
function resolveAppUrl(): string {
  const vercel = env.VERCEL_URL.trim();
  return (
    env.NEXT_PUBLIC_APP_URL.trim() ||
    env.APP_URL.trim() ||
    (vercel ? `https://${vercel}` : "") ||
    "http://localhost:3000"
  );
}

/** Origin Better Auth signs cookies and callback URLs against. */
function resolveAuthUrl(): string {
  return env.BETTER_AUTH_URL.trim() || resolveAppUrl();
}

export const appUrl: string = resolveAppUrl();
export const authUrl: string = resolveAuthUrl();

/**
 * What this product calls itself. `src/brand.ts` is the source of truth; the
 * env var only exists so one deployment can be renamed without a rebuild of
 * the brand tokens.
 */
export const appName: string = env.APP_NAME.trim() || brand.name;

/** Capability flags derived from which credentials are actually present. */
export const features = {
  db: env.DATABASE_URL.length > 0,
  stripe: env.STRIPE_SECRET_KEY.length > 0,
  resend: env.RESEND_API_KEY.length > 0,
  googleOAuth: env.GOOGLE_CLIENT_ID.length > 0 && env.GOOGLE_CLIENT_SECRET.length > 0,
  ai: env.AI_GATEWAY_API_KEY.length > 0,
  demo: env.DEMO_MODE === "1",
} as const;
