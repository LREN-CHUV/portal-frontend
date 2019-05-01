FROM node:latest

ADD yarn.lock /yarn.lock
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
RUN yarn

WORKDIR /app
ADD . /app
RUN /bin/bash -c 'echo REACT_APP_BACKEND_URL=\"http://portalbackend:8080\" | tee -a .env'


EXPOSE 3000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["test"]