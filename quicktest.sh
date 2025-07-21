docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d 1337rank-w-kda.tech
