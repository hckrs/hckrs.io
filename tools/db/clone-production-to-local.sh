. config-local.sh
. config-production.sh

. backup-production.sh
mongorestore -h $l_address:$l_port -d $l_database --drop $p_path/$p_database
