#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-production

mongodump -h $p_address:$p_port -d $p_database -u $p_username -p $p_password -o $p_path
open $p_path