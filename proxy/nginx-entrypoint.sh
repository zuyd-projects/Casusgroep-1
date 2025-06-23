#!/bin/bash
set -e

# Default to empty strings for hosts if not provided
BACKEND_HOST=${BACKEND_HOST:-backend}
BACKEND_PORT=${BACKEND_PORT:-8080}
NEXTJS_HOST=${NEXTJS_HOST:-frontend}
NEXTJS_PORT=${NEXTJS_PORT:-3000}

# Process the template with the available variables
envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${NEXTJS_HOST} ${NEXTJS_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.tmp

# Check if DOMAIN_NAME is set and not empty
if [ -n "${DOMAIN_NAME}" ] && [ "${DOMAIN_NAME}" != "_" ]; then
  echo "Domain name set to ${DOMAIN_NAME}, configuring SSL..."
  
  # Add domain-specific configuration
  SSL_CONFIG=$(cat <<EOF

  # Domain-specific configuration with SSL
  server {
    listen 80;
    server_name ${DOMAIN_NAME};

    # For certbot challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect HTTP to HTTPS for domain
    location / {
        return 301 https://\$host\$request_uri;
    }
  }
  
  # HTTPS server for domain
  server {
    listen 443 ssl;
    server_name ${DOMAIN_NAME};
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;
    
    # SSL parameters
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    location /api/ {
      set \$backend_host "${BACKEND_HOST}:${BACKEND_PORT}";
      proxy_pass http://\$backend_host;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
      set \$nextjs_host "${NEXTJS_HOST}:${NEXTJS_PORT}";
      proxy_pass http://\$nextjs_host;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
  }
EOF
)
  
  # Replace the placeholder with the SSL configuration
  sed "s|# DOMAIN_NAME_PLACEHOLDER|${SSL_CONFIG}|" /etc/nginx/nginx.conf.tmp > /etc/nginx/nginx.conf
  
  # Check if we need to obtain a new certificate
  if [ ! -d "/etc/letsencrypt/live/${DOMAIN_NAME}" ]; then
    echo "Obtaining initial SSL certificate for ${DOMAIN_NAME}..."
    
    # Start nginx temporarily to handle the certbot authentication
    nginx -g "daemon on;"
    
    # Get the certificate
    certbot certonly --nginx --non-interactive --agree-tos --email ${CERT_EMAIL:-webmaster@localhost} -d ${DOMAIN_NAME}
    
    # Stop nginx after obtaining the certificate
    nginx -s stop
    
    echo "SSL certificate obtained successfully."
  else
    echo "SSL certificate already exists for ${DOMAIN_NAME}."
  fi
  
  # Set up a cron job to renew certificates
  echo "0 12 * * * /renew-certs.sh" > /etc/crontabs/root
  crond
else
  echo "No domain name provided or set to wildcard. Skipping SSL setup."
  # Just use the basic config without SSL
  cp /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf
fi

# Clean up temporary file
rm -f /etc/nginx/nginx.conf.tmp

echo "Starting nginx..."
# Start nginx in foreground
exec nginx -g "daemon off;"