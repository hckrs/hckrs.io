#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOOLS="$ROOT/tools"
HCKRS="$TOOLS/hckrs"

# Check if meteor is installed
if ! command -v meteor ; then
  echo "Install meteor..."
  curl https://install.meteor.com | /bin/sh
fi

# Add 'hckrs' executable to PATH
if ! command -v hckrs ] ; then
  echo "Install hckrs..."
  chmod +x $HCKRS
  export PATH=$PATH:$TOOLS
fi

# Start hckrs
echo "hckrs.io development bundle successfully installed!"
echo "Now enter the command 'hckrs' to startup a local server."
