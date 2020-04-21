FROM node:latest

WORKDIR /app

COPY yarn.lock /app
COPY package.json /app

ENV PATH=$PATH:/app/node_modules/.bin
RUN yarn

WORKDIR /app
COPY . /app
COPY ./test-server/run.sh /app/run.sh

ENTRYPOINT ["/bin/bash", "./run.sh"]
CMD ["test"]
