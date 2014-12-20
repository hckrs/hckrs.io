#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"
TOOLS="$ROOT/tools"


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

# Install hckrs executable
echo "Install hckrs..."

# Add executable to $PATH
EXPORT="export PATH=$PATH:$HOME/.hckrs"
if [ -f $HOME/.bash_profile > /dev/null ]; then
  echo $EXPORT >> $HOME/.bash_profile
elif [ -f $HOME/.profile > /dev/null ]; then
  echo $EXPORT >> $HOME/.profile
else
  echo "Can't install hckrs executable."
  echo "Instead you can call ./tools/hckrs from the command line manually."
  exit 1
fi
$EXPORT

# Copy executable to $HOME directory
mkdir -p $HOME/.hckrs
cp $TOOLS/hckrs $HOME/.hckrs/hckrs
chmod +x $HOME/.hckrs/hckrs

# Start hckrs
echo "hckrs.io development bundle successfully installed!"
echo ""
echo "Now move to the project folder:"
echo "    cd web"
echo "And start up a local server:"
echo "    hckrs run"
echo ""