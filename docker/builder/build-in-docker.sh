#!/bin/sh

echo ">>> Building inside Docker"
cd /frontend

npm install
bower install
grunt build

echo ">>> Frontend build is complete"
