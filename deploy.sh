#!/bin/bash
set -e

PROJECT_ROOT="/home/saai/osu-log"

echo "Updating code..."
cd $PROJECT_ROOT
git pull origin main

echo "Building Svelte Frontend..."
cd "$PROJECT_ROOT/osu-log-svelte"
npm install
npm run build

echo "Setting up Backend..."
cd "$PROJECT_ROOT/osu-log-backend"
npm install

echo "Restarting Services..."
sudo systemctl restart osu-log-frontend
sudo systemctl restart osu-log-backend

echo "✅ Build and Deployment complete!"
