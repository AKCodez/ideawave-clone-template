import type { Brand } from "@/design/types";

export const brand = {
  "name": "Clone Kit",
  "tagline": "The design kit every IdeaWave build starts from.",
  "wordmark": {
    "case": "lower",
    "tracking": "tight",
    "weight": 600,
    "monogram": {
      "letters": "CK",
      "shape": "rounded"
    }
  },
  "direction": "editorial",
  "scheme": "dark",
  "palette": {
    "accentHue": 48,
    "accentChroma": 0.16,
    "neutrals": "warm"
  },
  "type": {
    "display": "instrument-serif",
    "body": "inter-tight",
    "mono": "jetbrains-mono"
  },
  "motion": {
    "intensity": "lively",
    "durationScale": 1
  },
  "voice": {
    "adjectives": [
      "precise",
      "warm",
      "direct"
    ],
    "phrases": [
      "Compose, do not design.",
      "Every token comes from the brand.",
      "Hover and press are never optional.",
      "An honest empty state beats invented proof.",
      "Ship the loop people came for."
    ],
    "avoid": [
      "revolutionary",
      "synergy",
      "game-changing",
      "seamless"
    ]
  },
  "imagery": {
    "rules": [
      "Product frames over stock photography",
      "Screenshots show seeded demo data, never lorem",
      "No faces, no handshakes, no abstract 3D blobs"
    ]
  },
  "composition": {
    "hero": "split",
    "bento": "dense",
    "stats": "numerals"
  },
  "credit": {
    "startupUrl": "https://ideawave.io",
    "builtInMinutes": null
  },
  "meta": {
    "generator": "ideawave-clone-studio",
    "version": 1,
    "buildId": "template"
  }
} as const satisfies Brand;

export default brand;
