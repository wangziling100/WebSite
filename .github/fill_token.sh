#!/bin/bash

old_dir=`pwd`
cd $(dirname $0)
cd ../lambda/push
sed -i "s/your token/$CMS_TOKEN/g" env.json
sed -i "s/your token/$CMS_TOKEN/g" template.yaml
cd $old_dir