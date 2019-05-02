FROM node:current

ADD yarn.lock /yarn.lock
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
RUN yarn

WORKDIR /app
ADD . /app
RUN /bin/bash -c 'echo REACT_APP_BACKEND_URL="http://localhost:8080/services" | tee .env'

ENTRYPOINT ["/bin/bash", "./run.sh"]
CMD ["test"]