#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PM2_NAME="${PM2_NAME:-laser-market}"
BRANCH="${1:-}"

echo "==> Deploy started at $(date -Iseconds)"
echo "==> App dir: $APP_DIR"
echo "==> PM2 app: $PM2_NAME"

cd "$APP_DIR"

if [[ ! -d .git ]]; then
  echo "ERROR: .git directory not found in $APP_DIR"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found in $APP_DIR"
  exit 1
fi

if [[ -n "$BRANCH" ]]; then
  echo "==> Switching to branch: $BRANCH"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "==> Pulling latest changes"
  git pull --ff-only
fi

echo "==> Installing dependencies"
npm install

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building app"
npm run build

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  echo "==> Restarting PM2 process"
  pm2 restart "$PM2_NAME" --update-env
else
  echo "==> Starting PM2 process"
  pm2 start npm --name "$PM2_NAME" -- start
fi

echo "==> Saving PM2 state"
pm2 save

echo "==> Deploy finished successfully"
