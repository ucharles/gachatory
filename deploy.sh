#!/bin/bash

# Define a timeout for waiting on services to be ready
TIMEOUT=500 # seconds

# Check if Blue is currently running
IS_BLUE_UP=$(docker ps | grep "nextjs-blue")

# Ensure nginx is running
docker compose up -d nginx

if [ "$IS_BLUE_UP" ]; then
  echo "Blue is up, deploying green"
  docker compose build green
  docker compose up -d green
  START_TIME=$(date +%s)
  while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$(($CURRENT_TIME - $START_TIME))
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo "Timeout waiting for green to be ready"
      exit 1
    fi
    sleep 2
    # Change to check the green service health
    REQUEST=$(docker exec nginx curl http://green:3000)
    if [ -n "$REQUEST" ]; then
      echo "Green is up"
      break
    fi
  done
  # Update nginx config to point to green
  sed -i 's/proxy_pass http:\/\/blue:3000;/proxy_pass http:\/\/green:3000;/' ./nginx/default.conf
  echo "Reload nginx"
  docker exec nginx nginx -s reload
  # Stop blue service
  docker compose stop blue
else
  echo "Green is up, deploying blue"
  docker compose build blue
  docker compose up -d blue
  START_TIME=$(date +%s)
  while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$(($CURRENT_TIME - $START_TIME))
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo "Timeout waiting for blue to be ready"
      exit 1
    fi
    sleep 2
    # Change to check the blue service health
    REQUEST=$(docker exec nginx curl http://blue:3000)
    if [ -n "$REQUEST" ]; then
      echo "Blue is up"
      break
    fi
  done
  # Update nginx config to point to blue
  sed -i 's/proxy_pass http:\/\/green:3000;/proxy_pass http:\/\/blue:3000;/' ./nginx/default.conf
  echo "Reload nginx"
  docker exec nginx nginx -s reload
  # Stop green service
  docker compose stop green
fi

echo "Deploy finished"
