/**
 * The zod half of the contract. Same rules as IdeaWave's `src/lib/clone/kit.ts`,
 * so a `src/brand.ts` that IdeaWave writes and a `src/brand.ts` a human edits
 * are held to one standard. `scripts/design-check.mjs` runs `validateBrand`.
 */
import { z } from "zod";
import { BENTO_DENSITIES, DIRECTIONS, FONT_KEYS, HERO_LAYOUTS, SCHEMES, STATS_STYLES, fontIssues, type Brand } from "./types";

function httpsUrl(value: string): boolean {
  return /^https:\/\/[^\s]+$/.test(value);
}

/** `src/brand.ts` in a build: the file shape, validated identically on both sides. */
export const BrandSchema = z
  .object({
    name: z.string().min(2).max(24),
    tagline: z.string().max(80),
    wordmark: z.object({
      case: z.enum(["lower", "title", "upper"]),
      tracking: z.enum(["tight", "normal", "wide"]),
      weight: z.union([z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
      monogram: z.object({
        letters: z.string().min(1).max(2),
        shape: z.enum(["circle", "square", "rounded", "hexagon"]),
      }),
    }),
    direction: z.enum(DIRECTIONS),
    scheme: z.enum(SCHEMES),
    palette: z.object({
      accentHue: z.number().min(0).max(360),
      accentChroma: z.number().min(0.06).max(0.3),
      neutrals: z.enum(["warm", "cool", "neutral"]),
    }),
    type: z.object({
      display: z.enum(FONT_KEYS),
      body: z.enum(FONT_KEYS),
      mono: z.enum(FONT_KEYS),
    }),
    motion: z.object({
      intensity: z.enum(["calm", "lively", "bold"]),
      durationScale: z.number().min(0.7).max(1.4),
    }),
    voice: z.object({
      adjectives: z.array(z.string().min(2).max(24)).length(3),
      phrases: z.array(z.string().min(3).max(120)).length(5),
      avoid: z.array(z.string().min(1).max(40)).max(12),
    }),
    imagery: z.object({ rules: z.array(z.string().min(3).max(160)).max(8) }),
    composition: z.object({
      hero: z.enum(HERO_LAYOUTS),
      bento: z.enum(BENTO_DENSITIES),
      stats: z.enum(STATS_STYLES),
    }),
    credit: z.object({
      startupUrl: z.string().refine(httpsUrl, "https URL"),
      builtInMinutes: z.number().int().min(0).nullable(),
    }),
    meta: z.object({
      generator: z.literal("ideawave-clone-studio"),
      version: z.literal(1),
      buildId: z.string().min(1),
    }),
  })
  .superRefine((brand, ctx) => {
    for (const issue of fontIssues(brand.direction, brand.type)) {
      ctx.addIssue({ code: "custom", path: ["type", issue.slot], message: issue.message });
    }
  });

/**
 * Compile-time proof that the hand-written `Brand` type and this schema describe
 * the same object. Either of these lines stops type-checking if they drift.
 */
export const schemaSatisfiesType: (value: z.infer<typeof BrandSchema>) => Brand = (value) => value;
export const typeSatisfiesSchema: (value: Brand) => z.infer<typeof BrandSchema> = (value) => value;

export type BrandIssue = { path: string; message: string };

/** Human-readable validation used by `design:check`, never at runtime. */
export function validateBrand(value: unknown): { ok: true; brand: Brand } | { ok: false; issues: BrandIssue[] } {
  const parsed = BrandSchema.safeParse(value);
  if (parsed.success) return { ok: true, brand: parsed.data };
  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    })),
  };
}
