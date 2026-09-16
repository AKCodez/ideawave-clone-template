#!/usr/bin/env bash
# Everything that must be green before any change counts as done.
# Same three commands as `npm run verify`, runnable directly in a sandbox.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> tsc --noEmit"
npx tsc --noEmit

echo "==> eslint . --quiet"
npx eslint . --quiet

echo "==> next build"
npx next build

echo "==> verify passed"
