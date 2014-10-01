#!/bin/sh
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ".." && pwd )"

cd $ROOT
echo
echo "Which branch to publish?"
git branch
echo 
read -p "Type the branch name: " branch
echo "Publish $branch to staging master..."
git push staging $branch:master && heroku config:add METEOR_SETTINGS="`cat settings/staging.json`" --remote staging