# Changelog

## 2.16.0 - 2019/03/13
* Algorithm tests completed, testing 20 algorithms (Woken, Exareme) see ./app/v3/src/components/API/__tests__/Integration/Experiments/README.txt
* Algorithm fixes
* Updated yarn libraries (react, highcharts)
* Various UI fixes (Dropdown, results)

## 2.15.8 - 2019/03/08
* Implemented Helpdesk forms (Angular, React)
* New Term of Services page

## 2.15.6 - 2019/02/25
* Quick implementation of linear regression from Exareme

## 2.15.5 - 2019/02/24
* UI fixes
* Fixed filter bug
* Fixed heatmap visualisation
* Libs; swaped numeral (buggy) for numbro
* Formatted linearRegression


## 2.15.4 - 2019/02/22
* Fixed filter query bug
* Modularized plotly.js -> -1.20 Mo on build
* Integration and e2e test for Heatmap API
* Fixed Heatmap formating bugs for federation
* [numeral](https://www.npmjs.com/package/numeral) lib added for scientific notation
* Fixed visualisation bug to Woken format (see HBPLD-256 in jira)
* More testing for linear regression federated, 1 or several datasets
* Updated react libs
* Fixed typing, imports, canvas testing, ansync tests
* [Migrated](https://vincenttunru.com/migrate-create-react-app-typescript-to-create-react-app/) from create-react-app-typescript to Create React App

## 2.15.3 2019/02/18

* Tests
    * Jest and Enzyme config for Typescript
    * `yarn test`
    * Render tests for top level components, App, Results, Create
    * API Integration tests for Model: create and update
    * E2E tests based on mocks, federated mode
        * naivebayes
        * linearregression
* React version
    * Updated all librairies to latest version
    * Added bugsnag client
    * Fixed kfold polynominal presponse processing bug
