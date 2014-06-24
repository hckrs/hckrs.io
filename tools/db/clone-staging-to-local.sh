. config-local.sh
. config-staging.sh

. backup-staging.sh
mongorestore -h $l_address:$l_port -d $l_database --drop $s_path/$s_database
