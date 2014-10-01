#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

. $ROOT/tools/.config-production

read -p "This OVERWRITES the PRODUCTION database, are you sure? y/n" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    mongorestore -h $p_address:$p_port -d $p_database -u $p_username -p $p_password --drop $p_path/$p_database
fi

