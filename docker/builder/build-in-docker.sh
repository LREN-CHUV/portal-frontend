#!/bin/sh

echo ">>> Building inside Docker"
cd /frontend

npm install
bower install

if [ "$production" = true ] ; then
  build_option=--production
fi

echo ">>> grunt $build_option"

grunt build $build_option

echo ">>> Frontend build is complete"
