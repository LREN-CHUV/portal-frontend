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

## Either with the MIP deployment package

- Checkout the master branch of the [mip-deployment](https://github.com/HBPMedical/mip-deployment) project, and follow the setup instructions.

## or by running the tests

- `./run-test.sh`

### Frontend development with React

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

- Install [nodejs](https://nodejs.org)
- Install [yarn](https://yarnpkg.com/en/)
- Run: `yarn install`
- Run: `yarn watch`
- Browse to [http://localhost:3000](http://localhost:3000)

## Tests

### Local

You can generate models and experiments by running the tests:

- `./run-test.sh` or with a regex `./run-test.sh test anova`

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
