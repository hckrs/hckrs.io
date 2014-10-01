#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-staging

mongorestore -h $s_address:$s_port -d $s_database -u $s_username -p $s_password --drop $s_path/$s_database

