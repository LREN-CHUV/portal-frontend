#!/bin/sh

grunt ngconstant:dev
grunt watch &
angular-http-server --path /frontend/app -p8000
