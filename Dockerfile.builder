FROM digitallyseamless/nodejs-bower-grunt

COPY ./docker/builder/build-in-docker.sh /

VOLUME /frontend

# Create a user with id 1000, with some luck it should match your user on the host machine.
RUN adduser --uid 1000 build
USER build

CMD ["/build-in-docker.sh"]
