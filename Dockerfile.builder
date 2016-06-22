FROM digitallyseamless/nodejs-bower-grunt

COPY ./docker/build-in-docker.sh /

VOLUME /frontend

CMD ["/build-in-docker.sh"]
