#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"
DRY_RUN=0
AGENT="auto"

usage() {
  echo "Usage: install-skills.sh [--agent codex|claude|all] [--dry-run]"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --agent) AGENT="${2:?--agent requires codex, claude, or all}"; shift ;;
    --agent=*) AGENT="${1#--agent=}" ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

case "$AGENT" in auto|codex|claude|all) ;; *) echo "Invalid agent: $AGENT" >&2; exit 1 ;; esac

install_to() {
  local label="$1" destination="$2"
  echo "==> $label → $destination"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [dry-run] codoop-game and _shared"
    return
  fi

  mkdir -p "$destination"
  # Replace only this project's previously installed directories.
  rm -rf "$destination/codoop-game" "$destination/_shared"
  cp -R "$SKILLS_DIR/codoop-game" "$destination/codoop-game"
  cp -R "$SKILLS_DIR/_shared" "$destination/_shared"
  echo "  + codoop-game"
  echo "  + _shared"
}

if [[ "$AGENT" == "auto" || "$AGENT" == "codex" || "$AGENT" == "all" ]]; then
  install_to "codex" "${CODEX_HOME:-$HOME/.codex}/skills"
fi
if [[ "$AGENT" == "auto" || "$AGENT" == "claude" || "$AGENT" == "all" ]]; then
  install_to "claude" "${CLAUDE_HOME:-$HOME/.claude}/skills"
fi

echo "Done. Re-run this script to update the standalone Skill installation."
