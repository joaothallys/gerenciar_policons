#!/bin/sh
set -eu

TEMPLATE="/usr/share/nginx/html/env.template.js"
OUTPUT="/usr/share/nginx/html/env.js"

if [ -f "$TEMPLATE" ]; then
  envsubst '${VITE_REACT_APP_API_HOST}' < "$TEMPLATE" > "$OUTPUT"
fi
