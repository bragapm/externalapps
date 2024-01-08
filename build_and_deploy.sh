#!/bin/bash

# Start build processes in the background and store their PIDs
(cd extensions && pnpm build) &
PID1=$!
(cd web && pnpm build) &
PID2=$!

# Wait for all background processes to finish and capture their exit statuses
wait $PID1
STATUS1=$?
wait $PID2
STATUS2=$?

# Check if all builds were successful
if [ $STATUS1 -eq 0 ] && [ $STATUS2 -eq 0 ]; then
    echo "All builds succeeded. Proceeding with deployment."
    eb deploy
    echo "Build and deploy completed."
else
    echo "Build failed. Deployment aborted."
    exit 1
fi
