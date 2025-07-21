#!/bin/bash
CERT_PATH="/etc/letsencrypt/live/1337rank-w-kda.tech/fullchain.pem"

echo "Waiting for cert at $CERT_PATH..."
while [ ! -f "$CERT_PATH" ]; do
  sleep 2
done

echo "Certs found. Starting nginx..."
nginx -g "daemon off;"
