curl --request POST -s \
     --header 'content-type: application/json' \
     --data "{\"itemType\":\"238671\", \"title\": \"test1\", \"content\":\"bcd\", \"priority\": 5, \"completeness\": 0, \"startTime\": null, \"evaluation\": null, \"allowPriorityChange\": false, \"ref\": \"test\", \"refId\": null, \"owner\": \"\", \"contributor\": \"\", \"tag\": \"\", \"itemStatus\": \"active\", \"layer\": 0, \"parents\": null}" \
     https://0eaw1uy00c.execute-api.eu-central-1.amazonaws.com/Prod/push
