#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-staging
. $ROOT/tools/.config-production
. $ROOT/tools/backup-production.command

mongorestore -h $s_address:$s_port -d $s_database -u $s_username -p $s_password --drop $p_path/$p_database