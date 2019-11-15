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

#!/usr/bin/env bash
# Key-Value Store
EXAREME_KEYSTORE="exareme-keystore:8500"

# Docker internal folder for the Exareme data
DOCKER_DATA_FOLDER="/root/exareme/data/"

FEDERATION_ROLE="master"

LOCAL_DATA_FOLDER="./data/"
imageName="hbpmip/exareme"
tag="v21.2.0"
ADDR=$(wget http://ipinfo.io/ip -qO -)

if [[ $(docker info | grep Swarm | grep inactive*) != '' ]]; then
  echo -e "\nInitialize Swarm.."
  docker swarm init --advertise-addr=$ADDR
else
  echo -e "\nLeaving previous Swarm.."
  docker swarm leave -f
  sleep 1
  echo -e "\nInitialize Swarm.."
  docker swarm init --advertise-addr=$ADDR
fi

if [[ $(docker network ls | grep mip-local) == '' ]]; then
  echo -e "\nInitialize Network"
  docker network create \
    --driver=overlay --opt encrypted --subnet=10.20.30.0/24 --ip-range=10.20.30.0/24 --gateway=10.20.30.254 mip-local
fi

#Get hostname of node
name=$(hostname)
echo "name: $name"
echo "ADDR: $ADDR"

echo -e "\nUpdate label name for Swarm node "$name
docker node update --label-add name=${name} ${name}
echo -e "\n"

#Remove services if already existed
if [[ $(docker service ls | grep ${name}"_exareme-keystore") != '' ]]; then
  docker service rm ${name}"_exareme-keystore"
fi

if [[ $(docker service ls | grep ${name}"_exareme-master") != '' ]]; then
  docker service rm ${name}"_exareme-master"
fi

env FEDERATION_NODE=${name} FEDERATION_ROLE=${FEDERATION_ROLE} EXAREME_IMAGE=${imageName}":"${tag} \
  EXAREME_KEYSTORE=${EXAREME_KEYSTORE} DOCKER_DATA_FOLDER=${DOCKER_DATA_FOLDER} \
  LOCAL_DATA_FOLDER=${LOCAL_DATA_FOLDER} \
  docker stack deploy -c docker-compose-master.yml ${name}
