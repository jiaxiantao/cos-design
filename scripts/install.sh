#!/usr/bin/env sh
set -e
exec node "$(dirname "$0")/install.mjs" "$@"
