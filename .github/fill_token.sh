#!/bin/bash

old_dir=`pwd`
cd $(dirname $0)
cd ../lambda/push
sed -i "s/your token/$CMS_TOKEN/g" env.json
sed -i "s/your token/$CMS_TOKEN/g" template.yaml
sed -i "s/your password/$PASSWORD/g" env.json
sed -i "s/your password/$PASSWORD/g" template.yaml
cd $old_dir
cd ../lambda/build
sed -i "s/your token/$CMS_TOKEN/g" env.json
sed -i "s/your token/$CMS_TOKEN/g" template.yaml
sed -i "s/your password/$PASSWORD/g" env.json
sed -i "s/your password/$PASSWORD/g" template.yaml
sed -i "s/your password/$PASSWORD/g" events/event.json
cd $old_dir
cd ../lambda/auth
sed -i "s/your id/$CLIENT_ID/g" env.json
sed -i "s/your secret/$CLIENT_SECRET/g" env.json
sed -i "s/bucket name/$BUCKET_NAME/g" env.json
sed -i "s/file name/$FILE_NAME/g" env.json
sed -i "s/app id/$APP_ID/g" env.json
sed -i "s/your id/$CLIENT_ID/g" template.yaml
sed -i "s/your secret/$CLIENT_SECRET/g" template.yaml
sed -i "s/bucket name/$BUCKET_NAME/g" template.yaml
sed -i "s/file name/$FILE_NAME/g" template.yaml
sed -i "s/app id/$APP_ID/g" template.yaml
cd $old_dir
cd ../lambda/regi
sed -i "s/your id/$CLIENT_ID/g" env.json
sed -i "s/your secret/$CLIENT_SECRET/g" env.json
sed -i "s/bucket name/$BUCKET_NAME/g" env.json
sed -i "s/file name/$FILE_NAME/g" env.json
sed -i "s/app id/$APP_ID/g" env.json
sed -i "s/your id/$CLIENT_ID/g" template.yaml
sed -i "s/your secret/$CLIENT_SECRET/g" template.yaml
sed -i "s/bucket name/$BUCKET_NAME/g" template.yaml
sed -i "s/file name/$FILE_NAME/g" template.yaml
sed -i "s/app id/$APP_ID/g" template.yaml
cd $old_dir
cd ../lambda/github-publish
sed -i "s/your token/$CMS_TOKEN/g" env.json
sed -i "s/your token/$CMS_TOKEN/g" template.yaml
sed -i "s/your password/$PASSWORD/g" env.json
sed -i "s/your password/$PASSWORD/g" template.yaml
cd $old_dir
