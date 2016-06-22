#!/bin/bash -e

docker run --rm -i -t \
          -p 8082:8082 \
          hbpmip/frontend:latest /bin/bash
