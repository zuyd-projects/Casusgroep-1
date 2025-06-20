FROM alpine:latest

# Install curl, openssl, bash, docker CLI, jq (JSON parser)
RUN apk add --no-cache bash curl openssl docker-cli jq

# Copy script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]