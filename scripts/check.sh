#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -x "${ROOT_DIR}/.beryl/scripts/check.sh" ]]; then
  printf "ERROR: Missing .beryl/scripts/check.sh (or not executable).\n" >&2
  exit 1
fi

"${ROOT_DIR}/.beryl/scripts/check.sh"
