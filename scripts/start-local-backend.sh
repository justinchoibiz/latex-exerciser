#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

docker compose up -d postgres

cd "$ROOT_DIR/apps/api"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate

python -m pip install -r requirements.txt

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000