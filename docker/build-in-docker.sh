#!/bin/sh

echo ">>> Building inside Docker"
cd /frontend

npm install
bower install
grunt ngconstant:prod

echo ">>> Frontend build is complete"
