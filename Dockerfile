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

# org.label-schema.build-date=$BUILD_DATE
# org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.schema-version="1.0" \
        org.label-schema.license="AGPLv3" \
        org.label-schema.name="portal-frontend" \
        org.label-schema.description="Nginx server configured to serve the frontend of the MIP portal" \
        org.label-schema.url="https://mip.humanbrainproject.eu" \
        org.label-schema.vendor="CHUV" \
        org.label-schema.docker.dockerfile="Dockerfile" \
        org.label-schema.memory-hint="10"

EXPOSE 80 443

CMD ["/run.sh"]
