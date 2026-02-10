#!/bin/bash
set -e  # Exit immediately if a command fails

cd /home/saai/osu-log
git pull

cd osu-log-svelte
npm install
npm run build

cd osu-log-backend
npm install

# These will only run if everything above succeeded
echo "Build complete!"
sudo systemctl restart osu-log-frontend
sudo systemctl restart osu-log-backend
