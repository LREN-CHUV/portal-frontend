#!/bin/sh

echo ">>> Building inside Docker"
cd /frontend

npm install
bower install
grunt build-env:docker

echo ">>> Frontend build is complete"
