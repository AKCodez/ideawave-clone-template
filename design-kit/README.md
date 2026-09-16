# The design kit

Everything visual in this repo is derived from one file: `src/brand.ts`. It is
data. `scripts/brand-gen.ts` turns it into two generated files, and components
consume only the tokens those files define.

```
src/brand.ts ──▶ scripts/brand-gen.ts ──▶ src/app/brand.generated.css   (@theme + both schemes)
                                       └▶ src/design/fonts.generated.ts (three font loaders)
```

Run `npm run brand:gen` after any change to `src/brand.ts`. Both generated files
are committed; `npm run design:check` fails if they are stale.

## The rule

**Never write a literal colour, radius, shadow, duration or font size in a
component.** There is no Tailwind palette to write one with: the generated
`@theme` resets `--color-*`, `--font-*`, `--radius-*` and `--shadow-*` to
`initial`, so `text-white`, `bg-zinc-900` and `shadow-lg` compile to nothing.

## Colour: 17 tokens, two schemes

| Token | Utility | What it is for |
| --- | --- | --- |
| `canvas` | `bg-canvas` | The page itself |
| `surface` | `bg-surface` | Cards, panels, table headers |
| `elevated` | `bg-elevated` | Menus, popovers, a card on a card |
| `overlay` | `bg-overlay` | The scrim behind a dialog (carries alpha) |
| `line` | `border-line` | Hairline rules and default borders |
| `line-strong` | `border-line-strong` | Emphasised borders, the brutal offset shadow |
| `ink` | `text-ink` | Primary text. 12:1 on canvas, guaranteed |
| `muted` | `text-muted` | Secondary text. 4.6:1 on surface, guaranteed |
| `faint` | `text-faint` | Timestamps, captions, disabled text. 3:1 |
| `accent` | `bg-accent` `text-accent` | The one colour the brand owns. 3:1 on canvas |
| `accent-hover` | `hover:bg-accent-hover` | The accent's hover state |
| `accent-soft` | `bg-accent-soft` | Tinted backgrounds, badges, selected rows |
| `on-accent` | `text-on-accent` | Text on `accent`. 4.5:1 on it, guaranteed |
| `positive` | `text-positive` | Success. 4.5:1 on surface |
| `warning` | `text-warning` | Caution. 4.5:1 on surface |
| `critical` | `text-critical` | Errors and destructive actions. 4.5:1 on surface |
| `focus` | `outline-focus` | The focus ring. Set globally; do not restyle |

Both schemes are always emitted. `<html data-scheme="dark">` (set from
`brand.scheme` in the root layout) selects one. Opacity modifiers work:
`bg-accent/10`, `border-line/60`.

## Type: eight steps, each a whole decision

`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`,
`text-small`, `text-caption`.

Each carries its own size (a fluid `clamp`), line height, letter spacing and
weight, per direction. `text-h2` is the entire typographic decision for a
heading: do not add `leading-*`, `tracking-*` or `font-bold` next to it.

Families: `font-display`, `font-body`, `font-mono`. The `numeric` utility is
mono plus tabular figures, for money, counts and timestamps.

## Space, radius, stroke, elevation

- Rhythm: `py-section` between sections, `gap-stack` / `mt-stack` inside one.
- Measure: `max-w-prose` (reading column), `max-w-content` (default page),
  `max-w-wide` (full-bleed layouts). `prose-measure` is the same as `max-w-prose`.
- Radius: `rounded-sm|md|lg|xl|2xl`, plus `rounded-input` for controls. The
  brutal direction sets every one of them to `0`, on purpose.
- Stroke: `border-(length:--stroke)` and `--stroke-strong`. Brutal draws 2px.
- Elevation: `shadow-1` through `shadow-4`, plus `shadow-hard` (brutal's flat
  offset) and `shadow-glow` (luminous's lit ring). Shadow tints are per scheme.

## Motion

- Durations: `--duration-1` (snap) to `--duration-5` (the long reveal), already
  multiplied by `brand.motion.durationScale`.
- Easings: `ease-out-soft`, `ease-out-expo`, `ease-spring`, `ease-step`.
- `--motion-duration` and `--motion-ease` are the direction's own reveal
  defaults. `--motion-distance`, `--motion-lift`, `--motion-tilt` and
  `--motion-marquee` carry the brand's intensity (`calm` 0.6x, `lively` 1x,
  `bold` 1.3x).

Use `transition-transform`, `transition-opacity` and `transition-colors` with
`duration-(--duration-2)` and `ease-out-soft`. Animate `transform`, `opacity` and
`clip-path` only.

## The four directions

| Direction | Reads as |
| --- | --- |
| `editorial` | A magazine: oversized serif headlines, hairline rules, near-square corners, text that wipes up from behind a mask |
| `luminous` | A launch keynote: deep space canvas, geometric sans, big soft corners, glowing glass panels, springy motion |
| `brutal` | A printed poster: zero radius, 2px rules, flat offset shadows that shift on press, heavy uppercase display, motion in steps |
| `craft` | A well-made book: warm paper neutrals, a reading serif, medium corners, page-lift shadows, calm fades |

A direction is chosen once, in `src/brand.ts`. Components never branch on it
except where the kit already does (`Hero`, `ProductFrame`, and the hover and
press states in `src/app/components.css`).

## Reading tokens from TypeScript

`src/design/tokens.ts` exports the same values as JavaScript, for the OG image,
the icon, the manifest, email and motion defaults:

```ts
import { tokens } from "@/design/tokens";

tokens.active.hex.accent;      // "#e8a33d" - flat hex for og/icon/email
tokens.motion.durations[2];    // 420 (ms)
tokens.direction.key;          // "editorial"
tokens.fonts.ogFile;           // "instrument-serif-400.ttf"
```
