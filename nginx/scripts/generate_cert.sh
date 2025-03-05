#!/bin/sh

CERT_DIR="/etc/nginx/certs"
mkdir -p "$CERT_DIR"

# 인증서가 없을 때만 생성
if [ ! -f "$CERT_DIR/private.key" ] || [ ! -f "$CERT_DIR/certificate.crt" ]; then
  echo "Generating self-signed SSL certificate..."
  openssl req -x509 -newkey rsa:4096 -keyout "$CERT_DIR/private.key" -out "$CERT_DIR/certificate.crt" -days 365 -nodes -subj "/CN=localhost"
  echo "SSL certificate generated!"
else
  echo "SSL certificate already exists. Skipping generation."
fi

exec "$@"