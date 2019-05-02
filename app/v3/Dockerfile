FROM node:current

ADD yarn.lock /yarn.lock
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
RUN yarn

WORKDIR /app
ADD . /app

ENTRYPOINT ["/bin/bash", "./run.sh"]
CMD ["test"]
