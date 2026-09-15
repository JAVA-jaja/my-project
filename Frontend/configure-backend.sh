#!/bin/sh
set -eu

: "${BACKEND_URL:?Set BACKEND_URL to the reachable backend origin, for example https://your-backend.onrender.com}"
envsubst '${BACKEND_URL}' < /etc/nginx/backend.conf.template > /etc/nginx/conf.d/default.conf
