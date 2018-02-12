[![CHUV](https://img.shields.io/badge/CHUV-LREN-AF4C64.svg)](https://www.unil.ch/lren/en/home.html) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html) [![DockerHub](https://img.shields.io/badge/docker-hbpmip%2Fportal--frontend-008bb8.svg)](https://hub.docker.com/r/hbpmip/portal-frontend/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/9143f566eca64ffbb06258c61fb64ea0)](https://www.codacy.com/app/hbp-mip/portal-frontend?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LREN-CHUV/portal-frontend&amp;utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master.svg?style=svg)](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master)

# MIP portal frontend

## Libraries
- AngularJS v1.6.8
- Bootstrap v3.3.7

## Frontend development
This is a minimal setup to do frontend development in this project:
1. Checkout the frontend_dev branch of the `compose-everything-locally` project and run it. You will have the MIP backend running on your computer with no frontend.
2. Install gulp & yarn global
  * `npm install -g gulp` (might require `sudo`)
  * `npm install -g yarn` (might require `sudo`)
3. Install npm`:
  * `yarn install` (might require `sudo`)
4. Run the `portal-frontend`:
  * `gulp`
  * `google-chrome --disable-web-security --user-data-dir http://localhost:8000` (opens the frontend in Chrome with flags to ignore CORS issues. CORS must be disabled for development because the backend runs on a different domain name than the frontend)

## Develop & debug
1. Run: `./run.sh`
2. Open Browsersync External Access URL `google-chrome --disable-web-security --user-data-dir http://localhost:8000`
(might be another access URL)

## Build

Run: `./build.sh`

## Publish on Docker Hub

Run: `./publish.sh`


## Tests
This is a setup to run unit-tests in this project:
1. Install karma-cli & phantomjs global
  * `npm install karma-cli phantomjs -g` (might require `sudo`)
3. Install npm`:
  * `yarn install` (might require `sudo`)
4. Run the `portal-frontend`:
  * `gulp`
  * `google-chrome --disable-web-security --user-data-dir http://localhost:8000` (opens the frontend in Chrome with flags to ignore CORS issues. CORS must be disabled for development because the backend runs on a different domain name than the frontend)


## License

Copyright © 2016-2017 LREN CHUV

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
