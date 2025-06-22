#!/bin/sh
set -e

: "${BACKEND_HOST:=backend}"
: "${BACKEND_PORT:=8080}"
: "${NEXTJS_HOST:=nextjs}"
: "${NEXTJS_PORT:=3000}"

envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${NEXTJS_HOST} ${NEXTJS_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g "daemon off;"