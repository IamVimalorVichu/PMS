#!/bin/bash

echo "Restarting Next.js frontend..."

# Kill any existing npm processes more thoroughly
pkill -f "node" || true
pkill -f "next" || true
pkill -f "npm" || true

echo "Checking if ports are clear..."
for port in {3000..3005}; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null || true
  fi
done

# Change to frontend directory and start npm without backgrounding
cd /workspace/pms-ui
npm run dev