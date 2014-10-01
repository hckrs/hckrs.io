#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-staging

mongodump -h $s_address:$s_port -d $s_database -u $s_username -p $s_password -o $s_path
open $s_path