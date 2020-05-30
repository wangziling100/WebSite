aws iam delete-access-key --access-key-id $ACCESS_KEY_ID --user-name $USER_NAME
aws iam detach-user-policy --user-name $USER_NAME --policy-arn $ASSUME_POLICY
aws iam detach-role-policy --role-name tmp-role --policy-arn $POLICY
aws iam delete-user --user-name $USER_NAME
aws iam delete-policy --policy-arn $ASSUME_POLICY
aws iam delete-role --role-name tmp-role
aws iam delete-policy --policy-arn $POLICY

token=$GITHUB_TOKEN
repo=$GITHUB_REPO

source del_sec.sh $token "ACCESS_KEY_ID" $repo
sleep 1
source del_sec.sh $token "POLICY" $repo
sleep 1
source del_sec.sh $token "ASSUME_POLICY" $repo
sleep 1
source del_sec.sh $token "USER_NAME" $repo
