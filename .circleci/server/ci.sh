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

if groups $USER | grep &>/dev/null '\bdocker\b'; then
  DOCKER="docker"
else
  DOCKER="$DOCKER"
fi

# This script is used for publish and continuous integration.

#!/usr/bin/env bash
# Key-Value Store
EXAREME_KEYSTORE="exareme-keystore:8500"

# Docker internal folder for the Exareme data
DOCKER_DATA_FOLDER="/root/exareme/data/"

# Portainer
PORTAINER_PORT="9000"
PORTAINER_IMAGE="portainer/portainer"
PORTAINER_VERSION=":latest"
PORTAINER_DATA=$(echo $PWD)"/portainer"

FEDERATION_ROLE="master"

#Check if data_path exist
if [[ -s dataPath.txt ]]; then
  :
else
  echo "What is the data_path for host machine?"
  read answer
  #Check that path ends with /
  if [[ "${answer: -1}" != "/" ]]; then
    answer=${answer}"/"
  fi
  echo LOCAL_DATA_FOLDER=${answer} >dataPath.txt
fi

LOCAL_DATA_FOLDER=$(cat dataPath.txt | cut -d '=' -f 2)

chmod 755 *.sh

#Check if Exareme docker image exists in file
if [[ -s exareme.yaml ]]; then
  :
else
  . ./exareme.sh
fi

if [[ $($DOCKER info | grep Swarm | grep inactive*) != '' ]]; then
  echo -e "\nInitialize Swarm.."
  $DOCKER swarm init --advertise-addr=$(wget http://ipinfo.io/ip -qO -)
else
  echo -e "\nLeaving previous Swarm.."
  $DOCKER swarm leave -f
  sleep 1
  echo -e "\nInitialize Swarm.."
  $DOCKER swarm init --advertise-addr=$(wget http://ipinfo.io/ip -qO -)
fi

if [[ $($DOCKER network ls | grep mip-local) == '' ]]; then
  echo -e "\nInitialize Network"
  $DOCKER network create \
    --driver=overlay --opt encrypted --subnet=10.20.30.0/24 --ip-range=10.20.30.0/24 --gateway=10.20.30.254 mip-local
fi

#Get hostname of node
name=$(hostname)

echo -e "\nUpdate label name for Swarm node "$name
$DOCKER node update --label-add name=${name} ${name}
echo -e "\n"

#Read image from file exareme.yaml
# image=""
# while read -r line; do
#   if [[ ${line:0:1} == "#" ]] || [[ -z ${line} ]]; then #comment line or empty line, continue
#     continue
#   fi

#   image=$(echo ${image})$(echo "$line" | cut -d ':' -d ' ' -d '"' -f 2 -d '"')":"

# done <exareme.yaml

# #remove the last : from string
# image=${image:0:-1}

# #imageName the first half of string image
# imageName=$(echo "$image" | cut -d ':' -f 1)

# #tag the second half of string image
# tag=$(echo "$image" | cut -d ':' -f 2)
# echo $image
# echo $imageName
# echo $tag

imageName="hbpmip/exareme"
tag="v21.2.0"

#Remove services if already existed
if [[ $($DOCKER service ls | grep ${name}"_exareme-keystore") != '' ]]; then
  $DOCKER service rm ${name}"_exareme-keystore"
fi

if [[ $($DOCKER service ls | grep ${name}"_exareme-master") != '' ]]; then
  $DOCKER service rm ${name}"_exareme-master"
fi

env FEDERATION_NODE=${name} FEDERATION_ROLE=${FEDERATION_ROLE} EXAREME_IMAGE=${imageName}":"${tag} \
  EXAREME_KEYSTORE=${EXAREME_KEYSTORE} DOCKER_DATA_FOLDER=${DOCKER_DATA_FOLDER} \
  LOCAL_DATA_FOLDER=${LOCAL_DATA_FOLDER} \
  $DOCKER stack deploy -c docker-compose-master.yml ${name}

# echo -e "\nDo you wish to run Portainer service? [ y/n ]"
# read answer

# while true; do
#   if [[ ${answer} == "y" ]]; then
#     if [[ $($DOCKER service ls | grep mip_portainer) != '' ]]; then
#       $DOCKER service rm mip_portainer
#     fi
#     . ./portainer.sh
#     break
#   elif [[ ${answer} == "n" ]]; then
#     break
#   else
#     echo ${answer}" is not a valid answer. Try again [ y/n ]"
#     read answer
#   fi
# done
