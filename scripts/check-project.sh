#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_BUILD_DIR}"' EXIT

printf "check-project: running fidelity tests\n"
node --test \
  "${ROOT_DIR}/tests/notes-content-fidelity.test.js" \
  "${ROOT_DIR}/tests/notion-ingestion-fidelity.test.js" \
  "${ROOT_DIR}/tests/pages-build-subpages.test.js" \
  "${ROOT_DIR}/tests/portfolio-repositories.test.js" \
  "${ROOT_DIR}/tests/pull-notion-topic-manifest.test.js" \
  "${ROOT_DIR}/tests/update-topic-subtitle.test.js"

printf "check-project: running static build smoke check\n"
node "${ROOT_DIR}/scripts/build-pages.js" \
  --manifest "${ROOT_DIR}/content/topic-manifest.json" \
  --out "${TMP_BUILD_DIR}/dist"

printf "check-project: OK\n"
