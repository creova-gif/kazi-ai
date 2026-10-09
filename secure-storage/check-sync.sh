#!/usr/bin/env sh
# @creova/secure-storage v1.0.0
# Source of truth: creova-gif/kazi-ai/secure-storage v1.0.0; keep in sync.
# Usage: sh secure-storage/check-sync.sh [ref]   (default ref: main)
# Compares this copy's SHA256SUMS with the source of truth in kazi-ai.
set -eu
REF="${1:-main}"
DIR="$(cd "$(dirname "$0")" && pwd)"
URL="https://raw.githubusercontent.com/creova-gif/kazi-ai/${REF}/secure-storage/SHA256SUMS"
curl -fsSL "$URL" | diff - "$DIR/SHA256SUMS" && echo "secure-storage in sync with kazi-ai@${REF}"
