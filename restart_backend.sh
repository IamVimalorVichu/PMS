#!/bin/bash
# Save this as /workspace/restart_backend.sh

echo "Restarting FastAPI backend..."
# Kill any existing uvicorn processes
pkill -f "uvicorn pms.main:app" || true
# Change to backend directory and start uvicorn
cd /workspace/pms-core
uvicorn pms.main:app --reload --host 0.0.0.0 &
echo "Backend restarted. Check for the Uvicorn startup message."