FROM nginx:1.28.0-alpine3.21-slim

RUN apk add --no-cache gettext certbot certbot-nginx bash dos2unix

RUN mkdir -p /var/www/certbot /etc/letsencrypt

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx-entrypoint.sh /docker-entrypoint.sh

RUN dos2unix /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]