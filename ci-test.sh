#!/usr/bin/env bash

set -o pipefail # trace ERR through pipes
set -o errtrace # trace ERR through 'time command' and other functions
set -o errexit  ## set -e : exit the script if any statement returns a non-true return value

run_test() {
    docker build -f ./test-server/test-docker/Dockerfile . -t hbpmip/portal-frontend:testing

    echo
    echo -e "Start MIP for testing"
    cd ./test-server
    ./run.sh

    echo
    echo -e "Waiting 2m for containers to be up"
    sleep 2m

    echo
    echo -e "Run tests in test container"
    docker run --rm -it -e BACKEND_URL=http://172.17.0.1:8080 hbpmip/portal-frontend:testing yarn ci-test

}

run_test
