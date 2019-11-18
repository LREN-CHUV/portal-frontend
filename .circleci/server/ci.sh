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

# Docker internal folder for the Exareme data
DOCKER_DATA_FOLDER="/root/exareme/data/"
FEDERATION_ROLE="master"
LOCAL_DATA_FOLDER="./data/"
IMAGE="hbpmip/exareme"
TAG="v21.2.0"

#Get hostname of node
HOSTNAME=$(hostname)
EXAREME_KEYSTORE="${HOSTNAME}_exareme-keystore:8500"

if [[ $(docker info | grep Swarm | grep inactive*) != '' ]]; then
  echo -e "\nInitialize Swarm.."
  docker swarm init
else
  echo -e "\nLeaving previous Swarm.."
  docker stack rm ${HOSTNAME}
  docker swarm leave -f
  sleep 1
  echo -e "\nInitialize Swarm.."
  docker swarm init
fi

if [[ $(docker network ls | grep mip-local) == '' ]]; then
  echo -e "\nInitialize Network"
  docker network create --driver=overlay --subnet=10.20.30.0/24 mip-local
fi

env FEDERATION_NODE=${HOSTNAME} FEDERATION_ROLE=${FEDERATION_ROLE} EXAREME_IMAGE=${IMAGE}":"${TAG} \
  EXAREME_KEYSTORE=${EXAREME_KEYSTORE} DOCKER_DATA_FOLDER=${DOCKER_DATA_FOLDER} \
  LOCAL_DATA_FOLDER=${LOCAL_DATA_FOLDER} \
  docker stack deploy -c docker-compose-master.yml ${HOSTNAME}
