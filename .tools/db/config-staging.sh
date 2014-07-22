mkdir -p "backup/staging"

s_address="dharma.mongohq.com"
s_port=10012
s_database="app20276747"
s_username="heroku"
s_password="64fb61dd02abec6de871330102fb582e"
s_mongo_url="mongodb://heroku:64fb61dd02abec6de871330102fb582e@dharma.mongohq.com:10012/app20276747"
s_path=$(cd ./backup/staging; pwd)