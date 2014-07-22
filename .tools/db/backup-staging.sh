. config-staging.sh

mongodump -h $s_address:$s_port -d $s_database -u $s_username -p $s_password -o $s_path