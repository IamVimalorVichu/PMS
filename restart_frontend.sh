#!/bin/bash
# Save this as /workspace/restart_frontend.sh

echo "Restarting Next.js frontend..."
# Kill any existing npm processes
pkill -f "npm run dev" || true
# Change to frontend directory and start npm
cd /workspace/pms-ui
npm run dev &
echo "Frontend restarted. Check for the Next.js startup message."