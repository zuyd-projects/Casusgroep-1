#!/bin/bash

# Renew the certificate
certbot renew --nginx --non-interactive

# Reload nginx to apply renewed certificates
nginx -s reload