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
    docker build --no-cache -t portal-frontend-dev -f ./Dockerfile-dev.yml .
else
    docker build -f ./Dockerfile-dev.yml -t hbpmip/portal-frontend-dev .
fi
docker run -it --rm -p8000:8000 --name portal_frontend_dev hbpmip/portal-frontend-dev
