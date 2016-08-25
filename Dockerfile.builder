FROM digitallyseamless/nodejs-bower-grunt

MAINTAINER mirco.nasuti@chuv.ch

# Create a user with id 1000, with some luck it should match your user on the host machine.
RUN adduser --quiet --uid 1000 build
USER build

COPY ./docker/builder/build-in-docker.sh /

VOLUME /frontend

CMD ["/build-in-docker.sh"]
