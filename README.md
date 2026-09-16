# IdeaWave clone template

A production-shaped Next.js starter with a complete design system attached.
IdeaWave's Clone Studio clones it into a sandbox, writes a brand and a spec into
it, and hands it to a coding agent that builds the actual product on top. It is
equally useful on its own as the day-one scaffold for a small SaaS.

Everything tedious and easy to get wrong is already wired and verified:

- **One brand file.** `src/brand.ts` is data. Colour, type, radius, shadow,
  rhythm and motion are all derived from it, including the OG image, the icon,
  the emails and the focus ring.
- **Four art directions** - editorial, luminous, brutal and craft - each with
  its own corners, strokes, shadows, type scale and motion signature.
- **Contrast that is solved, not hoped for.** The generator refuses to write a
  palette where body text misses 12:1 or secondary text misses 4.6:1.
- **Fifteen motion primitives** on `motion`, with scroll-driven CSS timelines,
  a no-JavaScript fallback, and reduced motion that removes movement.
- **Fourteen hand-rolled primitives** and eleven page sections. No component
  library, nothing to upgrade, no `tailwind.config`.
- **Next.js 16** App Router, React 19, TypeScript strict with
  `noUncheckedIndexedAccess`.
- **Prisma 7** on **Neon** Postgres through the driver adapter, with migrations.
- **Better Auth** email and password, plus Google when you supply the keys.
- **Stripe** Checkout mirrored by a verified webhook, **Resend** for email, and
  AI through the **Vercel AI Gateway** that degrades instead of throwing.

Nothing is required to build. With no `DATABASE_URL` and no secrets at all,
`npm run verify` still passes: missing credentials turn a feature off with a
readable message rather than crashing the app.

## Quick start

```bash
npm install
cp .env.example .env     # fill in what you have; all of it is optional
npm run dev
```

With a Neon database:

```bash
npm run db:migrate:deploy   # apply prisma/migrations
npm run db:seed             # the demo account, plus twelve seeded rows
```

Verify before you call anything done:

```bash
npm run verify   # brand:gen && tsc && eslint && design:check && next build
npm run test     # the unit suite
npm run start & npm run smoke
```

## Change how it looks

Edit `src/brand.ts` and run `npm run brand:gen`. Direction, scheme, accent hue,
neutrals, fonts, wordmark, motion intensity and voice all live there, and the
generator writes `src/app/brand.generated.css` and
`src/design/fonts.generated.ts` from it. Both are committed, and
`npm run design:check` fails if they drift.

To see the directions rather than read about them:

```bash
npm run brand:set luminous && npm run dev
node scripts/preview-directions.mjs        # builds and photographs all six
```

`design-kit/README.md` documents every token, primitive, section and motion
primitive, with four composition recipes and the anti-patterns that cost the
most time.

## What is where

| Path | What lives there |
| --- | --- |
| `src/brand.ts` | The only design decision in the repository |
| `src/design/` | Tokens, colour maths, the four directions, fonts, OG layouts |
| `src/components/ui/` | The primitives, hand-rolled |
| `src/components/sections/` | The eleven page sections |
| `src/components/motion/` | The motion kit |
| `src/content/` | Marketing copy, comparison content, demo data, routes |
| `src/lib/` | env, db, auth, session, stripe, email, ai |
| `prisma/` | Schema, migrations, the seed |
| `scripts/` | brand-gen, design-check, audit, preview, smoke |

## Continue in your agent

**Claude Code** reads `CLAUDE.md` on start, so it picks up the contract itself:

```bash
git clone <repo> && cd <dir> && claude
```

**Cursor** - open the folder. `CLAUDE.md` and `AGENTS.md` carry the same rules.

Push to GitHub to enable one-click import into Replit, Bolt and StackBlitz:

```
https://replit.com/new/github/<owner>/<repo>
https://bolt.new/~/github.com/<owner>/<repo>
https://stackblitz.com/github/<owner>/<repo>
```

## Deploying

Vercel reads `vercel.json`, which runs `npm run build`, which regenerates the
tokens first. Set `DATABASE_URL`, `DIRECT_URL` and `BETTER_AUTH_SECRET`, then
add `AI_GATEWAY_API_KEY`, Stripe and Resend keys when you want those features
on.

## License

MIT. See `LICENSE`.
