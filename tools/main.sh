#!/bin/bash
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"
TOOLS="$ROOT/tools"
WEB="$ROOT"


# Require to be in a project directory
function require_project_directory {
  if [ ! $(pwd) = $WEB ]; then
    echo "You are not in a Meteor project directory."
    echo ""
    exit 1
  fi
}

# Wait for meteor to be up and running
function wait_for_meteor {
  while ! hckrs alive; do
    echo "wait for meteor"
    sleep 2
  done
  echo "meteor alive!"
}

# Check if meteor is up and running
function is_meteor_running {
  curl -s --head http://localhost:3000 | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null
}

# Run meteor
function run {
  IP="$( ifconfig | grep -Eo 'inet (adr:|addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | tail -1 )"
  URL=http://$IP.xip.io:3000
  SETTINGS=$ROOT/settings/local.json

  export ROOT_URL=$URL
  meteor run --settings $SETTINGS
}



# MAIN CLI

if [ "$1" = "" ] || [ "$1" = "run" ]; then

  # Start up local server
  require_project_directory
  run

elif [ "$1" = "hello" ]; then

  # Echo
  echo "Hi!"

elif [ "$1" = "alive" ]; then

  # Verify if meteor is alive
  is_meteor_running

elif [ "$1" = "wait" ]; then

  # Wait for meteor to be alive
  wait_for_meteor

elif [ "$1" = "reset" ]; then

  # Reset project/database
  require_project_directory
  meteor reset


# ADMIN / PRIVATE #
elif [ "$1" = "admin" ]; then

  if [ "$2" = "backup" ]; then
    bash "$TOOLS/#private-backup-$3.sh"
  elif [ "$2" = "clone" ]; then
    bash "$TOOLS/#private-clone-$3-to-$4.sh"
  fi

# Otherwise
else
  echo "Unrecognized command!"
fi