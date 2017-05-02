FROM digitallyseamless/nodejs-bower-grunt:4

MAINTAINER mirco.nasuti@chuv.ch

# User 1000 already exists
USER 1000

COPY ./docker/builder/build-in-docker.sh /

VOLUME /frontend

CMD ["/build-in-docker.sh"]
