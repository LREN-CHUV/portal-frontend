#!/usr/bin/env bash

run_test() {
    docker build -f ./test-server/test-docker/Dockerfile . -t hbpmip/portal-frontend:testing

    echo -e "Stop running containers"
    docker stop $(docker ps -q)

    echo -e "Start MIP"
    cd ./test-server
    ./run.sh

    echo -e "Waiting 1m for containers to be up"
    sleep 1m

    echo -e "Run tests in test container"
    docker run --rm -it -e BACKEND_URL=http://172.17.0.1:8080 hbpmip/portal-frontend:testing yarn ci-test
}

echo -e "Run test [y/n]? "
echo -e "This will STOP all your RUNNING containers"
read answer
if [ "$answer" = "y" ]; then
    run_test
fi
