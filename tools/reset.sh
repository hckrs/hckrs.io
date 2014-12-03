#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"


# Reset database and initialize with dummy documents
function reset {
  echo "Reset database..."
  echo "Insert dummy documents... (wait a few seconds)"
  curl -s http://localhost:3000/tools/reset-db > /dev/null
  echo "Done!"
}

# Make sure meteor is stopped before calling reset
# otherwise show meteor's default error message
if hckrs alive ; then
  meteor reset
else
  meteor reset
  hckrs wait && reset && echo "Meteor stays running. Open your browser."  &  
  exec "hckrs" "run"
fi







