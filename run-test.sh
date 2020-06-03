#!/usr/bin/env bash

set -o pipefail # trace ERR through pipes
set -o errtrace # trace ERR through 'time command' and other functions
# set -o errexit  ## set -e : exit the script if any statement returns a non-true return value

# FIXME error checking context: 'can't stat ...postgres_data
sudo rm -rf ./test-server/mip-deployment/.stored_data

run_test() {
    docker build -f ./test-server/Dockerfile . -t hbpmip/portal-frontend:testing

    echo -e "Stop and restart containers [y/n]? "
    read answer
    if [ "$answer" = "y" ]; then
        echo
        echo -e "Stop running containers"
        sudo ./test-server/mip-deployment/mip stop --quiet

        echo
        echo -e "Start MIP for testing"
        sudo ./test-server/mip-deployment/mip start --quiet

        echo
        echo -e "Waiting 2m for containers to be up"
        sleep 2m
    fi

    echo

    COMMAND="docker run --rm -it -e BACKEND_URL=http://172.17.0.1:8080 hbpmip/portal-frontend:testing yarn"
    case $1 in
    no)
        echo -e "Done"
        ;;
    regex)
        echo -e "Run $2 test in test container"
        $COMMAND test $2
        ;;

    *)
        echo -e "Run tests in test container"
        $COMMAND ci-test
        ;;
    esac

}

run_test $@
