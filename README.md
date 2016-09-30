# MIP portal frontend

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)

## Libraries
- AngularJS v1.4.3
- Bootstrap v3.2.0

## Build & development

- Run npm install to retrieve all node dependencies
- Run "bower install" to retrieve all bower dependencies
- Run "grunt build" to build the project
- Run "grunt serve" to run the local server
- Run "npm install -g protractor" to install protractor and webdriver-manager
- Run "node ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update --standalone"

## Errors
- If "unable to locate grunt" => Run "npm install -g grunt-cli", "npm install", "grunt build", "grunt serve"
- If "Task "karma" not found" => Run "npm install grunt-karma --save-dev"


## Testing

Running `grunt test` will run the unit tests with karma.


## Develop & debug
One may use dev/docker-compose.yml

## License

Copyright © 2016 LREN CHUV

Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
