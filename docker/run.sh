#!/usr/bin/env bash

export USE_GZIP=${USE_GZIP:-false}
OPTS="-template /portal/conf/nginx.conf.tmpl:/etc/nginx/nginx.conf"

if [ ! -z "$PORTAL_BACKEND_SERVER" ]; then
  OPTS="$OPTS -wait tcp://${PORTAL_BACKEND_SERVER} -template /portal/conf/portal-backend-upstream.conf.tmpl:/etc/nginx/conf.d/portal-backend-upstream.conf"
  OPTS="$OPTS -template /portal/conf/proxy.conf.tmpl:/etc/nginx/conf.d/proxy.conf"
fi
if [ "$USE_GZIP" eq "true" ]; then
  OPTS="$OPTS -template /portal/conf/gzip.conf.tmpl:/etc/nginx/conf.d/gzip.conf"
else
  rm -f /etc/nginx/conf.d/gzip.conf
fi

exec dockerize $OPTS $@
