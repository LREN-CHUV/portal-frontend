FROM node:latest

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

COPY . /frontend
WORKDIR /frontend
RUN yarn install
