#!/bin/bash
set -e

PROJECT_ROOT="/home/saai/osu-log"

echo "Updating code..."
cd $PROJECT_ROOT
git pull origin main

echo "Building Svelte Frontend..."
cd "$PROJECT_ROOT/osu-log-svelte"
/usr/local/bin/npm ci
/usr/local/bin/npm run build

echo "Setting up Backend..."
cd "$PROJECT_ROOT/osu-log-backend"
/usr/local/bin/npm ci

echo "Restarting Services..."
sudo systemctl restart osu-log-frontend
sudo systemctl restart osu-log-backend

echo "✅ Build and Deployment complete!"
