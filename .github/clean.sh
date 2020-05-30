aws iam delete-access-key --access-key-id $ACCESS_KEY_ID --user-name $USER_NAME
aws iam detach-user-policy --user-name $USER_NAME --policy-arn $ASSUME_POLICY
aws iam detach-role-policy --role-name tmp-role --policy-arn $POLICY
aws iam delete-user --user-name $USER_NAME
aws iam delete-policy --policy-arn $ASSUME_POLICY
aws iam delete-role --role-name tmp-role
aws iam delete-policy --policy-arn $POLICY
