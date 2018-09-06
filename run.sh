#!/usr/bin/env bash

set -e

echo "INFO: Pass --federation argument to start in federation mode. Default is local"
MODE=local

for param in "$@"
do
  if [ "--no-cache" == "$param" ]; then
    NO_CACHE=0
  fi

  if [ "--federation" == "$param" ]; then
    MODE=federation
  fi
done

echo "INFO: starting in $MODE mode"
if [ $MODE = "local" ]; then
  echo "{\"version\": \"beta 0.0\", \"instanceName\": \"CHUV-DEV\", \"mode\": \"local\", \"theme\": \"colaus\"}" > app/scripts/app/config.json
else
  echo "{\"version\": \"beta 0.0\", \"instanceName\": \"CHUV-DEV\", \"mode\": \"federation\", \"theme\": \"colaus\"}" > app/scripts/app/config.json
fi

echo

if [ $NO_CACHE ] ; then
    echo "INFO: --no-cache"
    docker build --no-cache -t hbpmip/portal-frontend-dev -f ./Dockerfile-dev .
else
    docker build -t hbpmip/portal-frontend-dev -f ./Dockerfile-dev .
fi

docker run -v $(pwd)/app:/frontend/app -it --rm -p8000:8000 --name portal_frontend_dev hbpmip/portal-frontend-dev
