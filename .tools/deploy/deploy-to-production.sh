echo

read -p "This will PUSH branch MASTER to the PRODUCTION server! Are you sure? y/n" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Publish master to production master..."
  cd ../../
  git push production master:master && heroku config:add METEOR_SETTINGS="`cat settings-production.json`" --remote production
fi


