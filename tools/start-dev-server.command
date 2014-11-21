#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

IP="$( ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p' )"
URL=http://$IP.xip.io:3000
SETTINGS=settings/dev.json

cd $ROOT
export ROOT_URL=$URL

sleep 5 && open $URL & 
meteor run --settings $SETTINGS
