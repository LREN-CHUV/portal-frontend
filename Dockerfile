FROM nginx:1.11

MAINTAINER arnaud.jutzeler@chuv.ch

ENV DOCKERIZE_VERSION=v0.2.0

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y wget \
    && wget -O /tmp/dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
    && tar -C /usr/local/bin -xzvf /tmp/dockerize.tar.gz \
    && rm -rf /tmp/dockerize.tar.gz /var/lib/apt/lists/*

# Add nginx config
COPY ./docker/nginx.conf.tmpl \
     ./docker/proxy.conf.tmpl \
     ./docker/gzip.conf.tmpl \
     ./docker/portal-backend-upstream.conf.tmpl \
         /portal/conf/

COPY docker/run.sh /

# Add front end ressources
COPY ./dist/ /usr/share/nginx/html/

ENTRYPOINT ["/run.sh"]
CMD ["nginx", "-g", "daemon off;"]
