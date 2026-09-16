#!/usr/bin/env bash
# Everything that must be green before any change counts as done.
# The same chain as `npm run verify`, runnable directly in a sandbox.
#
# brand:gen comes first on purpose: it rewrites src/design/fonts.generated.ts
# from the brand file, and that generated module is what tsc then checks.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> brand:gen"
npx tsx scripts/brand-gen.ts

echo "==> tsc --noEmit"
npx tsc --noEmit

echo "==> eslint . --quiet"
npx eslint . --quiet

echo "==> next build"
npx next build

echo "==> verify passed"
