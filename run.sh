#!/usr/bin/env bash

set -e

for param in "$@"
do
  if [ "--no-cache" == "$param" ]; then
    no_cache=0
    break;
  fi
done

if [ $no_cache ] ; then
    echo "INFO: --no-cache"
    docker build --no-cache -t hbpmip/portal-frontend-dev -f ./Dockerfile-dev .
else
    docker build -t hbpmip/portal-frontend-dev -f ./Dockerfile-dev .
fi

docker run -v $(pwd)/app:/frontend/app -it --rm -p8000:8000 --name portal_frontend_dev hbpmip/portal-frontend-dev
