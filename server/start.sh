#!/usr/bin/env bash

set -o pipefail # trace ERR through pipes
set -o errtrace # trace ERR through 'time command' and other functions
set -o errexit  ## set -e : exit the script if any statement returns a non-true return value

if [[ $(docker info | grep Swarm | grep inactive) == '' ]]; then
    echo -e "\nLeaving previous Swarm.."
    docker stack rm miplocal
    docker swarm leave -f
    sleep 1
fi

echo -e "\nInitialize Swarm..."
docker swarm init

echo -e "\nDeploy Swarm..."
docker stack deploy -c docker-compose.yml miplocal
