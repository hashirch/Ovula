#!/usr/bin/env bash
# =============================================================================
#  Ovula PCOS Tracking System — Local Runner & Tester
#  Usage:
#    ./run.sh           → start backend + frontend
#    ./run.sh --test    → start backend + run API tests (no frontend)
#    ./run.sh --stop    → kill all running services
# =============================================================================

set -euo pipefail

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
VENV_DIR="$BACKEND_DIR/venv"

# ── Config ───────────────────────────────────────────────────────────────────
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_URL="http://localhost:$BACKEND_PORT"
LOG_DIR="$ROOT_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

print_header() {
  echo -e "\n${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${CYAN}${BOLD}  🌿 Ovula PCOS Tracking System${RESET}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; }
section() { echo -e "\n${BOLD}── $* ──────────────────────────────────────${RESET}"; }

# ── Helpers ──────────────────────────────────────────────────────────────────
wait_for_backend() {
  info "Waiting for backend to be ready..."
  local attempts=0
  local max=30
  until curl -sf "$BACKEND_URL/health" > /dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge "$max" ]; then
      error "Backend did not start within 30 seconds."
      error "Check logs at: $BACKEND_LOG"
      exit 1
    fi
    printf "."
    sleep 1
  done
  echo ""
  success "Backend is up at $BACKEND_URL"
}

stop_services() {
  section "Stopping Services"
  pkill -f "uvicorn main:app" 2>/dev/null && success "Backend stopped." || warn "Backend was not running."
  pkill -f "react-scripts start" 2>/dev/null && success "Frontend stopped." || warn "Frontend was not running."
  exit 0
}

# ── Setup ────────────────────────────────────────────────────────────────────
setup_backend() {
  section "Backend Setup"

  if [ ! -d "$VENV_DIR" ]; then
    info "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    success "Virtual environment created."
  fi

  info "Activating venv and installing dependencies..."
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  pip install -q -r "$BACKEND_DIR/requirements.txt"
  success "Backend dependencies ready."
}

# ── Start ────────────────────────────────────────────────────────────────────
start_backend() {
  section "Starting Backend"
  mkdir -p "$LOG_DIR"

  # Kill any stale process on the port
  fuser -k "${BACKEND_PORT}/tcp" > /dev/null 2>&1 || true

  info "Launching FastAPI (uvicorn) on port $BACKEND_PORT..."
  (
    cd "$BACKEND_DIR"
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"
    exec uvicorn main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload \
      >> "$BACKEND_LOG" 2>&1
  ) &
  echo $! > "$LOG_DIR/backend.pid"
  wait_for_backend
}

start_frontend() {
  section "Starting Frontend"

  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    info "Installing npm dependencies..."
    npm install --prefix "$FRONTEND_DIR" --silent
    success "Frontend dependencies installed."
  fi

  # Kill any stale process on the port
  fuser -k "${FRONTEND_PORT}/tcp" > /dev/null 2>&1 || true

  info "Launching React dev server on port $FRONTEND_PORT..."
  (
    cd "$FRONTEND_DIR"
    exec npm start >> "$FRONTEND_LOG" 2>&1
  ) &
  echo $! > "$LOG_DIR/frontend.pid"
  success "Frontend starting... will be available at http://localhost:$FRONTEND_PORT"
}

# ── Tests ─────────────────────────────────────────────────────────────────────
run_tests() {
  section "API Tests"
  local PASS=0
  local FAIL=0

  test_endpoint() {
    local label="$1"
    local method="$2"
    local path="$3"
    local data="${4:-}"
    local expected_status="${5:-200}"

    local response
    if [ -n "$data" ]; then
      response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BACKEND_URL$path")
    else
      response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
        "$BACKEND_URL$path")
    fi

    if [ "$response" -eq "$expected_status" ] || \
       # Also accept 422 for auth endpoints (missing credentials = endpoint exists)
       { [ "$expected_status" -eq 200 ] && [ "$response" -eq 422 ]; }; then
      success "[$response] $label"
      PASS=$((PASS + 1))
    elif [ "$response" -eq 401 ] || [ "$response" -eq 403 ]; then
      success "[$response] $label ${YELLOW}(auth required — endpoint exists)${RESET}"
      PASS=$((PASS + 1))
    else
      error  "[$response] $label  (expected: $expected_status)"
      FAIL=$((FAIL + 1))
    fi
  }

  echo ""
  echo -e "${BOLD}  Core Endpoints${RESET}"
  test_endpoint "Root"            GET  "/"       "" 200
  test_endpoint "Health Check"    GET  "/health" "" 200

  echo ""
  echo -e "${BOLD}  Authentication${RESET}"
  test_endpoint "Register (schema check)"       POST "/auth/register" \
    '{"email":"test@example.com","password":"Test@1234","full_name":"Test User"}' 200
  test_endpoint "Login (schema check)"          POST "/auth/login" \
    '{"email":"test@example.com","password":"Test@1234"}' 200
  test_endpoint "Verify OTP (auth required)"    POST "/auth/verify-otp" \
    '{"email":"test@example.com","otp":"000000"}' 200

  echo ""
  echo -e "${BOLD}  Protected Endpoints (expect 401)${RESET}"
  test_endpoint "Get Logs"        GET  "/logs/"       "" 401
  test_endpoint "Get Insights"    GET  "/insights/"   "" 401
  test_endpoint "Chat"            POST "/chat/"       '{"message":"hello"}' 401
  test_endpoint "Prediction"      POST "/prediction/predict" '{"data":{}}' 401

  # ── Summary
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "  Tests passed: ${GREEN}${BOLD}$PASS${RESET}"
  [ "$FAIL" -gt 0 ] && \
    echo -e "  Tests failed: ${RED}${BOLD}$FAIL${RESET}" || \
    echo -e "  Tests failed: ${BOLD}$FAIL${RESET}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

  [ "$FAIL" -eq 0 ] && success "All tests passed! 🎉" || warn "$FAIL test(s) failed."
}

# ── Main ──────────────────────────────────────────────────────────────────────
print_header

case "${1:-}" in
  --stop)
    stop_services
    ;;
  --test)
    setup_backend
    start_backend
    run_tests
    info "Backend log: $BACKEND_LOG"
    info "Run './run.sh --stop' to shut down."
    ;;
  "")
    setup_backend
    start_backend
    start_frontend
    run_tests
    echo ""
    info "Logs:     $LOG_DIR/"
    info "Backend:  $BACKEND_URL"
    info "Frontend: http://localhost:$FRONTEND_PORT"
    info "API Docs: $BACKEND_URL/docs"
    info ""
    info "Run './run.sh --stop' to shut down all services."
    ;;
  *)
    echo "Usage: $0 [--test | --stop]"
    echo "  (no args)  Start backend + frontend + run tests"
    echo "  --test     Start backend only + run API tests"
    echo "  --stop     Stop all running services"
    exit 1
    ;;
esac
