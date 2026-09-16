# IdeaWave clone template

A production-shaped Next.js starter. IdeaWave's Clone Studio clones it into a
sandbox, drops a spec at `.clone/SPEC.md`, and hands it to a coding agent that
builds the actual product on top. It is equally useful on its own as the day-one
scaffold for a small SaaS.

Everything that is tedious and easy to get wrong is already wired and verified:

- **Next.js 16** App Router, React 19, TypeScript strict with `noUncheckedIndexedAccess`
- **Tailwind v4**, CSS-first, three dark palettes with font pairings, no config file
- **Prisma 7** on **Neon** Postgres through the driver adapter, with an initial migration
- **Better Auth** email and password, plus Google when you supply the keys
- **Stripe** Checkout for one subscription price, mirrored by a verified webhook
- **Resend** for transactional email, which logs instead of sending when unconfigured

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
npm run db:seed             # demo@example.com / demo-pass-1234, plus two records
```

Verify before you call anything done:

```bash
npm run verify              # tsc --noEmit && eslint . --quiet && next build
npm run start & npm run smoke
```

`SMOKE_PATHS="/,/compare,/premium,/sign-in" npm run smoke` checks each path for
a 200, a real `<title>`, and no error text.

## What is where

| Path | What lives there |
| --- | --- |
| `src/app/` | Pages and the two route handlers (auth, Stripe webhook) |
| `src/components/ui/` | Button, Input, Card, Badge - hand-rolled, no library |
| `src/content/compare.ts` | Comparison-page content, the only place a competitor is named |
| `src/lib/` | env, db, auth, session, stripe, email |
| `prisma/` | Schema, the initial migration, the seed |
| `scripts/` | `verify.sh` and `smoke.mjs` |

Pick the look with `APP_PALETTE=ember|slate|meadow`. Each palette is a dark
token set plus its own display-serif and body-sans pairing, defined entirely in
`src/app/globals.css`. It is read at build time so prerendered and dynamic pages
always agree: changing it needs a rebuild.

## Continue in your agent

**Claude Code** reads `CLAUDE.md` on start, so it picks up the contract by itself:

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

Vercel reads `vercel.json`: `prisma generate && next build`. Set `DATABASE_URL`,
`DIRECT_URL` and `BETTER_AUTH_SECRET`, then add Stripe and Resend keys when you
want those features on.

## License

MIT. See `LICENSE`.
