[![CHUV](https://img.shields.io/badge/HBP-AF4C64.svg)](https://www.humanbrainproject.eu) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html) [![DockerHub](https://img.shields.io/badge/docker-hbpmip%2Fportal--frontend-008bb8.svg)](https://hub.docker.com/r/hbpmip/portal-frontend/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/9143f566eca64ffbb06258c61fb64ea0)](https://www.codacy.com/app/hbp-mip/portal-frontend?utm_source=github.com&utm_medium=referral&utm_content=HBPMedical/portal-frontend&utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/HBPMedical/portal-frontend/tree/master.svg?style=svg)](https://circleci.com/gh/HBPMedical/portal-frontend/tree/master)

# MIP portal frontend

## Summary

MIP Frontend is the web portal for the [Medical Informatics Platform for the Human Brain Project](https://hbpmedical.github.io/).

The portal runs on [React](https://reactjs.org), a JavaScript library for building user interfaces, and embed several libraries, among them are:

- [TypeScript](https://www.typescriptlang.org), a typed superset of JavaScript
- [D3.js](https://d3js.org) and [Highcharts](https://www.highcharts.com), visualizations and interactive charts libraries
- [Bootstrap](https://getbootstrap.com/), a frontend component library
- [Unstated](https://github.com/jamiebuilds/unstated), a state library

## Development

This is a minimal setup to do frontend development in this project:

### Run the Backend

- Checkout the master branch of the [mip-deployment-infrastructure](https://github.com/HBPMedical/mip-deployment-infrastructure) project, and follow the setup instructions.
- Create a new line in `/etc/hosts`, so the backend will be accessible through http://frontend/services
  - `sudo sh -c 'echo 127.0.1.1 frontend >> /etc/hosts'`
- Launch `./run.sh`. You will have the MIP frontend running on your computer at http://frontend

### React

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

- Install [nodejs](https://nodejs.org)
- Install [yarn](https://yarnpkg.com/en/)
- create a `.env` file
  - `echo REACT_APP_BACKEND_URL = \"http://frontend\" | tee .env`
- `yarn install`
- `yarn watch`
- Browse to [http://localhost:3000](http://localhost:3000)

## Tests

### Local

You can generate models and experiments by running the tests:

- `yarn test`

### Test live installations

You can use the mip-frontend test suite against any live installation, either locally

```
echo REACT_APP_BACKEND_URL = "https://qa.mip.chuv.ch" | tee .env &&
echo REACT_APP_TOKEN = "xxx" | tee -a .env &&
echo REACT_APP_JSESSIONID = "xxx" | tee -a .env &&
echo REACT_APP_AUTHORIZATION = "xxx" | tee -a .env
yarn test
```

or as a standalone docker

```
docker build . -f Dockerfile-test -t hbpmip/portal-frontend-tests
```

```
docker run -it \
-e BACKEND_URL="https://qa.mip.chuv.ch" \
-e TOKEN="c900a5c9-452e-4514-b8a8-c5dda02d03b6" \
-e JSESSIONID="2B5967D0870A33E2A55F5C9B641518FB" \
-e AUTHORIZATION="Basic c2dhMXJldmlld2VyczpIQlBzZ2Ex" \
--rm hbpmip/portal-frontend-tests:latest
```

Samples tests queries

```
hbpmip/portal-frontend-tests test
```

Tests run with Jest, see [the jest cli doc](https://jestjs.io/docs/en/cli) for more details

## Build (produce a local docker container)

Run: `./build.sh`

## Publish on Docker Hub

Run: `./publish.sh`

## License

Copyright © 2016-2020 LREN CHUV

Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Acknowledgements

This work has been funded by the European Union Seventh Framework Program (FP7/2007­2013) under grant agreement no. 604102 (HBP)

This work is part of SP8 of the Human Brain Project (SGA1).
