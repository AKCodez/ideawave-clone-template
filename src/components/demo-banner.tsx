import { features } from "@/lib/env";

/**
 * Shown only on demo previews (DEMO_MODE=1). It is the one place the preview
 * admits what it is, so nobody mistakes a seeded sandbox for a live product.
 */
export function DemoBanner() {
  if (!features.demo) return null;

  return (
    <div className="border-b border-accent/30 bg-accent-soft px-4 py-2 text-center text-sm text-ink">
      Demo preview built by IdeaWave Clone Studio - sign in with{" "}
      <span className="numeric">demo@example.com</span> /{" "}
      <span className="numeric">demo-pass-1234</span> - this preview expires in 7 days
    </div>
  );
}
