. config-staging.sh
. config-production.sh

. backup-production.sh
mongorestore -h $s_address:$s_port -d $s_database -u $s_username -p $s_password --drop $p_path/$p_database