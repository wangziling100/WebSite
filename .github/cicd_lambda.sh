#!/bin/bash

# CICD pipeline for your serverless functions

old_dir=`pwd`
cd $(dirname $0)/../lambda/push/

# build
echo '---------- build ----------'

sam build

# unit test
echo '---------- unit test ---------'
cd push 
npm install --no-optional > /dev/null
context=$(npm test) 
#echo "$result"
result=$(echo "$context" | egrep "passing|failing|pending")
echo "$result"
n_line=$(echo "$result" | wc -l)
if [[ $n_line -gt 1 ]];then
    echo "$context"
    exit 1
fi

#sleep 1
#cd .. && sam local invoke "Push" -e events/event.json
#sleep 5
echo '---------- deploy ----------'
cd ..

# deploy
sam deploy
cd $old_dir
