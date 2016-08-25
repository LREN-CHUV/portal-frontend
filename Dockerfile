FROM nginx:1.11

MAINTAINER arnaud.jutzeler@chuv.ch

ENV DOCKERIZE_VERSION=v0.2.0

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y wget \
    && wget -O /tmp/dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
    && tar -C /usr/local/bin -xzvf /tmp/dockerize.tar.gz \
    && rm -rf /tmp/dockerize.tar.gz /var/lib/apt/lists/*

# Add nginx config
COPY ./docker/runner/conf/nginx.conf.tmpl \
     ./docker/runner/conf/proxy.conf.tmpl \
     ./docker/runner/conf/gzip.conf.tmpl \
     ./docker/runner/conf/portal-backend-upstream.conf.tmpl \
         /portal/conf/

COPY docker/runner/run.sh /

# Add front end ressources
COPY ./dist/ /usr/share/nginx/html/

CMD ["/run.sh"]
