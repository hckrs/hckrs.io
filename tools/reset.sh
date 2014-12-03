#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

# Start up meteor if not already running
if ! hckrs alive ; then
  echo "startup meteor"
  hckrs run & hckrs wait
fi

# Reset database and initialize with dummy documents
echo "Reset database..."
echo "Insert dummy documents..."
curl -s http://localhost:3000/tools/reset-db > /dev/null
echo "Done!"

