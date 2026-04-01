#!/usr/bin/env bash
set -euo pipefail

SESSION_NAME="${1:-biaslens-dev}"

if command -v tmux >/dev/null 2>&1; then
  tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
fi

# Best-effort cleanup for non-tmux runs.
pkill -f "uvicorn api:app --host 0.0.0.0 --port 8000" >/dev/null 2>&1 || true
pkill -f "vite --host 0.0.0.0 --port 5173" >/dev/null 2>&1 || true
pkill -f "streamlit run app.py --server.port 8502" >/dev/null 2>&1 || true

echo "Stopped BiasLens dev processes (session: $SESSION_NAME)."
