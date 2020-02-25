#!/bin/env sh

docker build -f ./test-server/test-docker/Dockerfile . -t hbpmip/portal-frontend:testing

./run.sh

docker exec -it hbpmip/portal-frontend:testing

docker run --rm -it -e REACT_APP_BACKEND_URL=$(hostname -I | awk '{print $1}') hbpmip/portal-frontend:testing test
