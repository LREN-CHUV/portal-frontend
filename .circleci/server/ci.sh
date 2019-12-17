#!/usr/bin/env bash

#
# Execute the integration test suite in a Continuous Integration environment
#
# Option:
#   --all: execute the full suite of tests, including slow tests such as Chaos testing
#

set -o pipefail # trace ERR through pipes
set -o errtrace # trace ERR through 'time command' and other functions
set -o errexit  ## set -e : exit the script if any statement returns a non-true return value

# This script is used for publish and continuous integration.
HOSTNAME=$(hostname)

FRONTEND_URL="${HOSTNAME}"

# WARNING: substitution for image doesn't work on CircleCI
# because of https://docs.docker.com/compose/compose-file/#variable-substitution

EXAREME_IMAGE="hbpmip/exareme:dev_v3"
FRONTEND_IMAGE="hbpmip/portal-frontend:5.1.11"
BACKEND_IMAGE="hbpmip/portal-backend:5.0.4"

EXAREME_KEYSTORE="${HOSTNAME}_exareme-keystore:8500"

DOCKER_DATA_FOLDER="/root/exareme/data/"
FEDERATION_ROLE="master"
LOCAL_DATA_FOLDER="./data/"

# if [ $CIRCLECI = true ]; then
#   DOCKER="sudo docker"
# else
#   DOCKER="docker"
# fi

if [[ $(docker info | grep Swarm | grep inactive) == '' ]]; then
    echo -e "\nLeaving previous Swarm.."
    docker stack rm ${HOSTNAME}
    docker swarm leave -f
    sleep 1
fi

echo -e "\nInitialize Swarm.."
docker swarm init --advertise-addr "$(hostname -I | awk '{print $1}')"

if [[ $(docker network ls | grep mip-local) == '' ]]; then
    echo -e "\nInitialize Network"
    docker network create --driver=overlay --attachable --subnet=10.20.30.0/24 mip-local
fi

env HOSTNAME=${HOSTNAME} \
    FEDERATION_ROLE=${FEDERATION_ROLE} \
    EXAREME_IMAGE=${EXAREME_IMAGE} \
    EXAREME_KEYSTORE=${EXAREME_KEYSTORE} \
    DOCKER_DATA_FOLDER=${DOCKER_DATA_FOLDER} \
    LOCAL_DATA_FOLDER=${LOCAL_DATA_FOLDER} \
    FRONTEND_IMAGE=${FRONTEND_IMAGE} \
    BACKEND_IMAGE=${BACKEND_IMAGE} \
    FRONTEND_URL=${FRONTEND_URL} \
    docker stack deploy -c docker-compose-master.yml ${HOSTNAME}
