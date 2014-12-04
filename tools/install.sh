#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"
TOOLS="$ROOT/tools"
EXEC="$TOOLS/hckrs"


# OS Check. Put here because here is where we download the precompiled
# bundles that are arch specific.
UNAME=$(uname)
if [ "$UNAME" != "Linux" -a "$UNAME" != "Darwin" ] ; then
    echo "Sorry, this OS is not supported."
    exit 1
fi

if [ "$UNAME" = "Darwin" ] ; then
    if [ "i386" != "$(uname -p)" -o "1" != "$(sysctl -n hw.cpu64bit_capable 2>/dev/null || echo 0)" ] ; then

        # Can't just test uname -m = x86_64, because Snow Leopard can
        # return other values.
        echo "Only 64-bit Intel processors are supported at this time."
        exit 1
    fi
    ARCH="x86_64"
elif [ "$UNAME" = "Linux" ] ; then
    ARCH="$(uname -m)"
    if [ "$ARCH" != "i686" -a "$ARCH" != "x86_64" ] ; then
        echo "Unsupported architecture: $ARCH"
        echo "Meteor only supports i686 and x86_64 for now."
        exit 1
    fi
fi
PLATFORM="${UNAME}_${ARCH}"



# Check if meteor is installed
if ! command -v meteor > /dev/null ; then
  echo "Install meteor..."
  curl https://install.meteor.com | /bin/sh
fi

# Add 'hckrs' executable to PATH
if ! command -v hckrs > /dev/null ] ; then
  echo "Install hckrs..."
  chmod +x $EXEC
  export PATH=$PATH:$TOOLS
fi

# Start hckrs
echo ""
echo "hckrs.io development bundle successfully installed!"
echo "Now move to the project folder:"
echo "    cd web"
echo "And start up a local server:"
echo "    hckrs run"
echo ""