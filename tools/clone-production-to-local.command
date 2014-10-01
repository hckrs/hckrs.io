#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-local
. $ROOT/tools/.config-production
. $ROOT/tools/backup-production.command

mongorestore -h $l_address:$l_port -d $l_database --drop $p_path/$p_database
