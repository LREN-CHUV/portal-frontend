#!/usr/bin/env bash

set -o pipefail # trace ERR through pipes
set -o errtrace # trace ERR through 'time command' and other functions
set -o errexit  ## set -e : exit the script if any statement returns a non-true return value

if groups $USER | grep &>/dev/null '\bdocker\b'; then
        DOCKERCOMPOSE="docker-compose"
else
        DOCKERCOMPOSE="sudo docker"
fi

if [ ! -d "logs" ]; then
        sudo mkdir logs
fi

sudo chmod a+rwx logs

echo -e "\nRemoving previous services..."
$DOCKERCOMPOSE --project-name mip down

echo -e "\nDeploy Services..."
$DOCKERCOMPOSE --project-name mip up -d
