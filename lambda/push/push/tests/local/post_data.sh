curl --request POST -s \
     --header 'content-type: application/json' \
     --data "{\"test\":\"abc\", \"test2\": \"bcd\"}" \
     localhost:3000/push
