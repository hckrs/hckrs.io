. config-production.sh

mongodump -h $p_address:$p_port -d $p_database -u $p_username -p $p_password -o $p_path