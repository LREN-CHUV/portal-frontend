#!/bin/sh

grunt watch &
angular-http-server --path /frontend/app -p8000
