#!/usr/bin/env bash

export USE_GZIP=${USE_GZIP:-false}
OPTS="-template /portal/conf/nginx.conf.tmpl:/etc/nginx/nginx.conf"

if [ ! -z "$PORTAL_BACKEND_SERVER" ]; then
  OPTS="$OPTS -timeout 100s -template /portal/conf/portal-backend-upstream.conf.tmpl:/etc/nginx/conf.d/portal-backend-upstream.conf"
  IFS=','
  for backend in ${PORTAL_BACKEND_SERVER} ; do
    OPTS="$OPTS -wait tcp://$backend"
  done
  OPTS="$OPTS -template /portal/conf/proxy.conf.tmpl:/etc/nginx/conf.d/proxy.conf"
fi
if [ "$USE_GZIP" = "true" ]; then
  OPTS="$OPTS -template /portal/conf/gzip.conf.tmpl:/etc/nginx/conf.d/gzip.conf"
else
  rm -f /etc/nginx/conf.d/gzip.conf
fi

rm -f /etc/nginx/conf.d/default.conf

exec dockerize $OPTS nginx -g 'daemon off;'
