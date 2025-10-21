#!/bin/sh

if docker compose version >/dev/null 2>&1; then
    docker compose up --build
elif docker-compose --version >/dev/null 2>&1; then
    docker-compose up --build
else
    echo "Error: No se encontró docker compose ni docker-compose"
    exit 1
fi