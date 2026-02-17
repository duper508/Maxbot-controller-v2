#!/usr/bin/env sh
set -eu

# Runs from apps/web (Vercel Root Directory), so paths are relative to that.
npm install --include=dev --prefix ../..
npm exec --prefix ../.. -- tsc -p ../../packages/config/tsconfig.json
npm exec --prefix ../.. -- tsc -p ../../packages/commands/tsconfig.json
npm exec --prefix ../.. -- tsc -p ../../packages/ui/tsconfig.json
# Ensure a single React runtime at monorepo root for SSR/prerender.
npm install --include=dev --prefix ../.. react@18.2.0 react-dom@18.2.0 --no-save

NEXT_IGNORE_INCORRECT_LOCKFILE=1 npm run build --prefix ../../apps/web
