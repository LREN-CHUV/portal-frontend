[![CHUV](https://img.shields.io/badge/CHUV-LREN-AF4C64.svg)](https://www.unil.ch/lren/en/home.html) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html) [![DockerHub](https://img.shields.io/badge/docker-hbpmip%2Fportal--frontend-008bb8.svg)](https://hub.docker.com/r/hbpmip/portal-frontend/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/9143f566eca64ffbb06258c61fb64ea0)](https://www.codacy.com/app/hbp-mip/portal-frontend?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LREN-CHUV/portal-frontend&amp;utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master.svg?style=svg)](https://circleci.com/gh/LREN-CHUV/portal-frontend/tree/master)

# MIP portal frontend

## Libraries
- AngularJS v1.4.3
- Bootstrap v3.2.0

## Frontend development
This is a minimal setup to do frontend development in this project:
1. Checkout the frontend_dev branch of the `compose-everything-locally` project and run it. You will have the MIP backend running on your computer with no frontend.
2. Install npm and php (or any server that supports .htaccess)
3. Run the `portal-frontend`:
  * `npm install` (might require `sudo`)
  * `npm install -g grunt-cli` (might require `sudo`)
  * `npm install -g bower` (might require `sudo`)
  * `bower install`
  * `grunt ngconstant:dev`
  * `cp app/index-tmpl.html app/index.html` (creates an `index.html` file in the `app` directory based on the `index-tmpl.html` template)
  * `grunt watch &` (watches all JS/CSS files and automatically creates a bundle when a file is edited)
  * `cd app`
  * `php -S localhost:8000 &` (runs a development server from the `app` folder. PHP is not required, other development server should work, as long as it runs on port 8000 and supports .htaccess)
  * `google-chrome --disable-web-security --user-data-dir http://localhost:8000` (opens the frontend in Chrome with flags to ignore CORS issues. CORS must be disabled for development because the backend runs on a different domain name than the frontend)

## Build & development

* Run npm install to retrieve all node dependencies
* Run "bower install" to retrieve all bower dependencies
* Run "grunt build" to build the project
* Run "grunt serve" to run the local server
* Run "npm install -g protractor" to install protractor and webdriver-manager
* Run "node ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update --standalone"

## Errors
* If "unable to locate grunt" => Run "npm install -g grunt-cli", "npm install", "grunt build", "grunt serve"
* If "Task "karma" not found" => Run "npm install grunt-karma --save-dev"


## Testing

Running `grunt test` will run the unit tests with karma.


## Develop & debug
One may use dev/docker-compose.yml

## Build

Run: `./build.sh`

## Publish on Docker Hub

Run: `./publish.sh`

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
