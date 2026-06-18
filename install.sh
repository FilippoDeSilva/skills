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

# ─── install skills ───────────────────────────────────────────
step "Installing skills"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR"

if [ ! -d "$SKILLS_DIR" ]; then
  err "Skills directory not found at $SKILLS_DIR"
  exit 1
fi

# Find all skill directories
SKILLS=()
for skill_dir in "$SKILLS_DIR"/*/; do
  if [ -d "$skill_dir" ]; then
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
      SKILLS+=("$skill_name")
    fi
  fi
done

if [ ${#SKILLS[@]} -eq 0 ]; then
  err "No skills found with SKILL.md files"
  exit 1
fi

ok "Found ${#SKILLS[@]} skill(s): ${SKILLS[*]}"

# Install each skill
for skill in "${SKILLS[@]}"; do
  SKILL_DIR="$SKILLS_DIR/$skill"
  
  # Remove existing skill if present
  for dir in "$HOME/.claude/skills/$skill" "$HOME/.copilot/skills/$skill" "$HOME/.agents/skills/$skill"; do
    if [ -d "$dir" ]; then
      info "Removing existing $dir"
      rm -rf "$dir"
    fi
  done
  
  # Copy skill to all skill directories
  cp -R "$SKILL_DIR" "$HOME/.claude/skills/"
  ok "$skill installed at ~/.claude/skills/$skill"
  
  cp -R "$SKILL_DIR" "$HOME/.copilot/skills/"
  ok "$skill installed at ~/.copilot/skills/$skill"
  
  cp -R "$SKILL_DIR" "$HOME/.agents/skills/"
  ok "$skill installed at ~/.agents/skills/$skill"
done

# ─── outro ───────────────────────────────────────────────────
printf "\n${GREEN}"
cat <<'EOF'
   ╭──────────────────────────────────────────╮
   │   ✓ Installation Complete!              │
   │                                          │
   │   All skills are now available           │
   │   in your AI coding agent.               │
   ╰──────────────────────────────────────────╯
EOF
printf "${RST}\n"

info "Skills installed:"
for skill in "${SKILLS[@]}"; do
  info "  - $skill"
done

printf "\n${CYAN}Next steps:${RST}\n"
info "1. Restart your AI coding agent"
info "2. Type /skills to verify skills appear"
info "3. Ask about any skill to activate it\n"
