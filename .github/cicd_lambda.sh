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
#npm install --no-optional > /dev/null
yarn
context=$(npm test) 
#echo "$result"
result=$(echo "$context" | egrep "passing|failing|pending")
echo "$result"
n_line=$(echo "$result" | wc -l)
if [[ $n_line -ne 1 ]] || [[ -z "$result" ]];then
    echo "$context"
    exit 1
fi
echo '---------- integration test ----------'
cd ..
sam local start-api > out 2>&1 &
sleep 5
context=$(bash push/tests/local/post_data.sh)
response=$(echo "$context" | grep message)
response=$(echo "$response" | sed 's/{"message":"\([^"]*\).*/\1/g')
if [[ "$response" == "succeed" ]]; then
    echo "succeed"
else
    echo "$context"
    cat out
    echo "$response"
    exit 1
fi

#sleep 1
#cd .. && sam local invoke "Push" -e events/event.json
#sleep 5
echo '---------- deploy ----------'

# deploy
sam deploy
cd $old_dir
