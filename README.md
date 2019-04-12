[![CHUV](https://img.shields.io/badge/CHUV-LREN-AF4C64.svg)](https://www.unil.ch/lren/en/home.html) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html) [![DockerHub](https://img.shields.io/badge/docker-hbpmip%2Fportal--frontend-008bb8.svg)](https://hub.docker.com/r/hbpmip/portal-frontend/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/9143f566eca64ffbb06258c61fb64ea0)](https://www.codacy.com/app/hbp-mip/portal-frontend?utm_source=github.com&utm_medium=referral&utm_content=LREN-CHUV/portal-frontend&utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master.svg?style=svg)](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master)

# MIP portal frontend

## Summary

MIP Frontend is the web portal for the [Medical Informatics Platform for the Human Brain Project](https://hbpmedical.github.io/).

The portal is currently beeing migrated from Angular to React, and runs on both frameworks.

- React 16.8.4
- AngularJS 1.6.8
- Bootstrap 3.3.7

## Frontend development

This is a minimal setup to do frontend development in this project:

### Run the Backend

- Checkout the master branch of the [backend web-analytics-demo](https://github.com/LREN-CHUV/web-analytics-demo) project.
- If you are an HBP partner, you might want to use the `research_datasets` branch, which requires an authorization. You can ask for an access at support@humanbrainproject.eu . Once you're authorized, follow the [documentation](https://github.com/LREN-CHUV/web-analytics-demo/tree/research_datasets) about how to login to the private gitlab docker registry to get the datasets.
- Create a new line in `/etc/hosts`, so the backend will be accessible through http://frontend/services
  - `sudo sh -c 'echo 127.0.1.1 frontend >> /etc/hosts'`
- Launch `./run.sh`. You will have the MIP backend running on your computer at http://frontend

### React

- Install [nodejs](https://nodejs.org)
- Install [yarn](https://yarnpkg.com/en/)
- `cd /app/v3/`
- create a `.env` file
  - `sh -c 'echo REACT_APP_BACKEND_URL = \"http://frontend\" >> .env'`
- `yarn install`
- `yarn watch`
- Browse to [http://localhost:3000/v3/review](http://localhost:3000/v3/review)

#### Tests

You can generate models and experiments by running the tests:

- `yarn test`

### Angular (deprecated)

This part is no longuer updated. Will be migrated to the new React stack

1. Checkout this repo "portal-frontend" on staging branch.
2. There is two way to start the development frontend:
3. Either by docker, `./run.sh`
4. Or manually install gulp & yarn global

- `npm install -g gulp` (might require `sudo`)
- `npm install -g yarn` (might require `sudo`) (Debian/Ubuntu users should use `sudo apt-get install yarn`)
- `yarn install` (might require `sudo`)
- `gulp`
- `google-chrome --disable-web-security --user-data-dir http://localhost:8000` (opens the frontend in Chrome with flags to ignore CORS issues. CORS must be disabled for development because the backend runs on a different domain name than the frontend)

## Build (produce a local docker container)

Run: `./build.sh`

## Publish on Docker Hub

Run: `./publish.sh`

## Execution

See [Docker Readme](docker/README.md) for details about how to run the MIP frontend packaged as a Docker image.

See [Web Analytics starter](https://github.com/HBPMedical/web-analytics-demo) to deploy MIP Web portal and its analytics stack for development.

See [MIP Microservices Infrastructure](https://github.com/HBPMedical/mip-microservices-infrastructure) for the production deployment of the MIP platform

## Unit-tests

### using gulp

This is a setup to run unit-tests in this project using gulp:

1. To run unit-tests ones:

- `gulp unit-tests`

2. Start running karma unit tests:

- `gulp unit-tests:auto`

### using karma-cli

This is a setup to run unit-tests in this project using karma-cli:

1. Install karma-cli & phantomjs global

- `npm install karma-cli phantomjs -g` (might require `sudo`)

2. Start karma unit tests:

- `karma start karma.conf.js` (might require `sudo`)

## e2e-tests

e2e-testing works in chrome browser

### using gulp

This is a setup to run unit-tests in this project using gulp:

1. To run e2e-tests:

- `gulp e2e-test` (it starts serve "dist" folder with dev config)
  To run e2e test without rebuild dist folder use `gulp protractor-go` command in new terminal window

### using protractor global

This is a setup to run e2e-tests in this project using protractor:

1. Install protractor global, webdriver-manager

- `npm install -g protractor` (might require `sudo`) This will install two command line tools, protractor and webdriver-manager
- `webdriver-manager update` (might require `sudo`)
- `webdriver-manager start` (might require `sudo`)

2. Start karma unit tests:

- `protractor app/tests/e2e/e2e-conf.js` (might require `sudo`)
  (If you have a java error, try to install java: `sudo apt-get install default-jdk`).

## License

Copyright © 2016-2018 LREN CHUV

Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Acknowledgements

This work has been funded by the European Union Seventh Framework Program (FP7/2007­2013) under grant agreement no. 604102 (HBP)

This work is part of SP8 of the Human Brain Project (SGA1).
