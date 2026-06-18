#!/bin/bash

# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ─── colors ──────────────────────────────────────────────────
PINK='\033[38;5;205m'
YELLOW='\033[38;5;226m'
GREEN='\033[32m'
RED='\033[31m'
CYAN='\033[36m'
DIM='\033[2m'
RST='\033[0m'

step()  { printf "\n${PINK}●${RST} ${YELLOW}%s${RST}\n" "$*"; }
ok()    { printf "  ${GREEN}✓${RST} %s\n" "$*"; }
warn()  { printf "  ${YELLOW}⚠${RST} %s\n" "$*"; }
err()   { printf "  ${RED}✗${RST} %s\n" "$*"; }
info()  { printf "  ${DIM}%s${RST}\n" "$*"; }

# ─── intro ───────────────────────────────────────────────────
printf "${PINK}"
cat <<'EOF'
   ╭──────────────────────────────────────────╮
   │   OWASP SECURITY SKILL · INSTALLER      │
   │   OWASP Top 10 Security Best Practices   │
   ╰──────────────────────────────────────────╯
EOF
printf "${RST}\n"

# ─── detect platform ─────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
  Darwin) PLATFORM="mac" ;;
  Linux)  PLATFORM="linux" ;;
  *)      err "Unsupported OS: $OS — this script supports macOS and Linux."; exit 1 ;;
esac
ok "Platform detected: $PLATFORM"

# ─── system prereqs ──────────────────────────────────────────
step "Checking system prerequisites"

need_cmd() {
  local cmd="$1"
  local install_hint="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    ok "$cmd present"
    return 0
  else
    warn "$cmd missing — $install_hint"
    return 1
  fi
}

MISSING_REQ=0

# git
need_cmd git "install via Homebrew or your package manager" || MISSING_REQ=1

# curl
need_cmd curl "install via Homebrew or your package manager" || MISSING_REQ=1

if [ "$MISSING_REQ" -eq 1 ]; then
  err "Some prerequisites are missing. Install them and re-run this script."
  exit 1
fi

# ─── ensure dirs ─────────────────────────────────────────────
step "Setting up directories"
mkdir -p "$HOME/.claude/skills"
mkdir -p "$HOME/.copilot/skills"
mkdir -p "$HOME/.agents/skills"
ok "Directories ready"

# ─── install skill ───────────────────────────────────────────
step "Installing owasp-security skill"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$SCRIPT_DIR/owasp-security"

if [ ! -d "$SKILL_DIR" ]; then
  err "owasp-security directory not found at $SKILL_DIR"
  exit 1
fi

# Remove existing skill if present
for dir in "$HOME/.claude/skills/owasp-security" "$HOME/.copilot/skills/owasp-security" "$HOME/.agents/skills/owasp-security"; do
  if [ -d "$dir" ]; then
    info "Removing existing $dir"
    rm -rf "$dir"
  fi
done

# Copy skill to all skill directories
cp -R "$SKILL_DIR" "$HOME/.claude/skills/"
ok "owasp-security installed at ~/.claude/skills/owasp-security"

cp -R "$SKILL_DIR" "$HOME/.copilot/skills/"
ok "owasp-security installed at ~/.copilot/skills/owasp-security"

cp -R "$SKILL_DIR" "$HOME/.agents/skills/"
ok "owasp-security installed at ~/.agents/skills/owasp-security"

# ─── outro ───────────────────────────────────────────────────
printf "\n${GREEN}"
cat <<'EOF'
   ╭──────────────────────────────────────────╮
   │   ✓ Installation Complete!              │
   │                                          │
   │   OWASP Security skill is now available  │
   │   in your AI coding agent.               │
   ╰──────────────────────────────────────────╯
EOF
printf "${RST}\n"

info "Skill locations:"
info "  ~/.claude/skills/owasp-security"
info "  ~/.copilot/skills/owasp-security"
info "  ~/.agents/skills/owasp-security"

printf "\n${CYAN}Next steps:${RST}\n"
info "1. Restart your AI coding agent"
info "2. Type /skills to verify owasp-security appears"
info "3. Ask about OWASP security to activate the skill\n"
