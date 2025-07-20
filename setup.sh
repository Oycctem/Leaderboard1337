#!/bin/bash

# Create directories
mkdir -p certbot/conf certbot/www

# Start nginx without SSL first
docker-compose up -d nginx

# Get SSL certificate
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d 1337rank-w-kda.tech -d www.1337rank-w-kda.tech

# Restart with SSL
docker-compose restart nginx
