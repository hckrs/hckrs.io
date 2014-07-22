. config-staging.sh

mongorestore -h $s_address:$s_port -d $s_database -u $s_username -p $s_password --drop $s_path/$s_database

