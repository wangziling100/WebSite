curl --request POST -s \
     --header 'content-type: application/json' \
     --data "{\"itemType\":\"238671\", \"title\": \"abc\", \"content\":\"abc\", \"priority\": 5, \"completeness\": 0, \"startTime\": null, \"evaluation\": null, \"allowPriorityChange\": false, \"ref\": \"test\", \"refId\": null, \"owner\": \"\", \"contributor\": \"\", \"tag\": \"\", \"itemStatus\": \"active\", \"layer\": 0, \"parents\": null}" \
     localhost:3000/push
