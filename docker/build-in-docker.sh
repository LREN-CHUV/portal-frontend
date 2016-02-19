#!/bin/sh

echo ">>> Building inside Docker"
cd /frontend

npm install
bower install
grunt build-env:docker_dev

echo ">>> Frontend build is complete"
