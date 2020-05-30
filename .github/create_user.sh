#!/bin/bash

# usage: create_user.sh [-p policy json] [-n user name]

usage(){
    echo "Usage:"
    echo "create_user.sh [-p policy name] [-n user name] [-f policy json]"
    exit -1
}
name="tmp"
p_name="tmp-assume-policy"
assume_policy="policy/assume_role.json"
policy="abc"

args="`getopt -u -q -o "n:p:f:h" -l "policy,name,file,help" -- "$@"`"
[ $? -ne 0 ] && usage
set -- ${args}

while [ -n "$1" ]; do
    case "$1" in
        -n|--name) name=$2
            shift;;

        -f|--file) policy=$2
            shift;;

        -h|--help)
            usage
            shift;;

        -p|--policy) p_name=$2
            shift;;

        --) shift
            break;;

        *) usage
            echo $1
    esac
    shift
done
if [ -z "$policy" ]; then
    usage
    exit 1
fi

# create user and attach policy
user_arn=$(echo "$(aws iam create-user --user-name $name)" | grep arn |sed 's/.*\"Arn": "\(.*\)",/\1/g')

assume_policy_arn=$(echo "$(aws iam create-policy --policy-name $p_name --policy-document file://$assume_policy)" | grep arn | sed 's/.*\"Arn": "\(.*\)",/\1/g')

aws iam attach-user-policy --user-name $name --policy-arn "$assume_policy_arn"

user=test
user_arn=$(echo "$user_arn" | sed 's/arn:aws:iam\:\:\(.*\):user.*/\1/g')

tmp=$(cat policy/trust_role_template.json | sed "s/yours/arn:aws:iam::$user_arn:root/g" )
echo "$tmp" > trust_tmp.json

# create role and attach policy
aws iam create-role --role-name tmp-role --assume-role-policy-document file://trust_tmp.json > /dev/null

policy_arn=$(echo "$(aws iam create-policy --policy-name tmp-policy --policy-document file://$policy)" | grep arn | sed 's/.*\"Arn": "\(.*\)",/\1/g')
aws iam attach-role-policy --role-name tmp-role --policy-arn $policy_arn

access_context=$(aws iam create-access-key --user-name $name) 
access_key_id=$(echo "$access_context" | grep Id | sed 's/.*: "\(.*\)",/\1/g')
access_key=$(echo "$access_context" | grep Secret | sed 's/.*: "\(.*\)",/\1/g')
output="::set-output name=matrix::{\"user-name\":\"$name\",\"assume-policy\":\"$assume_policy_arn\",\"policy\":\"$policy_arn\",\"access-key-id\":\"$access_key_id\",\"access-key\":\"$access_key\"}"
rm trust_tmp.json

echo "$output"
