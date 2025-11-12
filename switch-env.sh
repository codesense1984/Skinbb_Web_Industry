#!/bin/bash

# Script to switch between DEV and PROD environments
# Usage: ./switch-env.sh [dev|prod]

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Error: Invalid environment. Use 'dev' or 'prod'"
    echo "Usage: ./switch-env.sh [dev|prod]"
    exit 1
fi

if [ ! -f ".env.$ENV" ]; then
    echo "Error: .env.$ENV file not found"
    exit 1
fi

# Copy the selected environment file to .env
cp ".env.$ENV" .env

echo "✓ Switched to $ENV environment"
echo "  Active environment file: .env"
echo ""
echo "Current configuration:"
grep -v "^#" .env | grep -v "^$" | sed 's/^/  /'

