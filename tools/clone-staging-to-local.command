#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-local
. $ROOT/tools/.config-staging
. $ROOT/tools/backup-staging.command

mongorestore -h $l_address:$l_port -d $l_database --drop $s_path/$s_database
