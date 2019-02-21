# Changelog

## 2.15.4
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
