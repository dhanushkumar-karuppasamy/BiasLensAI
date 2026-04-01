#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SESSION_NAME="biaslens-dev"
MODE="full"              # full | fallback
USE_TMUX=1
DETACH=0
INCLUDE_STREAMLIT=0

usage() {
  cat <<'EOF'
Usage: scripts/dev_up.sh [options]

Options:
  --fallback             Start frontend only (tests React fallback path).
  --with-streamlit       Also start legacy Streamlit app on :8502.
  --no-tmux              Run without tmux (background processes in current shell).
  --detach               In tmux mode, do not auto-attach.
  --session NAME         tmux session name (default: biaslens-dev).
  -h, --help             Show this help.

Ports:
  Frontend (React/Vite): http://localhost:5173
  Backend (FastAPI):     http://localhost:8000
  Streamlit (optional):  http://localhost:8502
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fallback)
      MODE="fallback"
      shift
      ;;
    --with-streamlit)
      INCLUDE_STREAMLIT=1
      shift
      ;;
    --no-tmux)
      USE_TMUX=0
      shift
      ;;
    --detach)
      DETACH=1
      shift
      ;;
    --session)
      SESSION_NAME="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -x "$ROOT_DIR/.venv/bin/python" ]]; then
  PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
elif [[ -x "$ROOT_DIR/venv/bin/python" ]]; then
  PYTHON_BIN="$ROOT_DIR/venv/bin/python"
else
  PYTHON_BIN="python3"
fi

FRONTEND_CMD="cd '$ROOT_DIR/frontend' && npm run dev -- --host 0.0.0.0 --port 5173"
BACKEND_CMD="cd '$ROOT_DIR' && '$PYTHON_BIN' -m uvicorn api:app --host 0.0.0.0 --port 8000"
STREAMLIT_CMD="cd '$ROOT_DIR' && '$PYTHON_BIN' -m streamlit run app.py --server.port 8502"

print_summary() {
  echo ""
  echo "🚀 BiasLens launch mode: $MODE"
  echo "   Frontend:  http://localhost:5173"
  if [[ "$MODE" == "full" ]]; then
    echo "   Backend:   http://localhost:8000"
  else
    echo "   Backend:   skipped intentionally (frontend fallback mode)"
  fi
  if [[ "$INCLUDE_STREAMLIT" -eq 1 ]]; then
    echo "   Streamlit: http://localhost:8502"
  fi
  echo ""
}

if [[ "$USE_TMUX" -eq 1 ]] && command -v tmux >/dev/null 2>&1; then
  if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "tmux session '$SESSION_NAME' already exists."
    print_summary
    if [[ "$DETACH" -eq 0 ]]; then
      tmux attach -t "$SESSION_NAME"
    fi
    exit 0
  fi

  tmux new-session -d -s "$SESSION_NAME" -n frontend "$FRONTEND_CMD"

  if [[ "$MODE" == "full" ]]; then
    tmux new-window -t "$SESSION_NAME" -n backend "$BACKEND_CMD"
  else
    tmux new-window -t "$SESSION_NAME" -n fallback "echo 'Fallback mode: backend intentionally off.' && sleep infinity"
  fi

  if [[ "$INCLUDE_STREAMLIT" -eq 1 ]]; then
    tmux new-window -t "$SESSION_NAME" -n streamlit "$STREAMLIT_CMD"
  fi

  tmux select-window -t "$SESSION_NAME:frontend"
  print_summary

  if [[ "$DETACH" -eq 0 ]]; then
    tmux attach -t "$SESSION_NAME"
  fi
  exit 0
fi

echo "tmux unavailable or disabled; starting in non-tmux mode."

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" >/dev/null 2>&1 || true
  done
}
trap cleanup EXIT INT TERM

bash -lc "$FRONTEND_CMD" &
PIDS+=("$!")

if [[ "$MODE" == "full" ]]; then
  bash -lc "$BACKEND_CMD" &
  PIDS+=("$!")
fi

if [[ "$INCLUDE_STREAMLIT" -eq 1 ]]; then
  bash -lc "$STREAMLIT_CMD" &
  PIDS+=("$!")
fi

print_summary
wait
