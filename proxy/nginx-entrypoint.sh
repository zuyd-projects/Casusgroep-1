#!/bin/bash
set -e

# Default to empty strings for hosts if not provided
BACKEND_HOST=${BACKEND_HOST:-backend}
BACKEND_PORT=${BACKEND_PORT:-8080}
NEXTJS_HOST=${NEXTJS_HOST:-frontend}
NEXTJS_PORT=${NEXTJS_PORT:-3000}

# Process the template with the available variables
envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${NEXTJS_HOST} ${NEXTJS_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf


echo "Starting nginx..."
# Start nginx in foreground
exec nginx -g "daemon off;"