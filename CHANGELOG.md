# Changelog

### 19.11.2019

- CircleCI script
- Tests updated

### 5.1.11 - 12.11.2019

- Galaxy Workflow Engine embedded in Federation Mode
- Workflow error handling for Galaxy based algorithms
- Algorithm widgets
  - factorial/additive
  - levels selection for categorical variables
- Removed Woken calls
- Using Exareme for
  - descriptive statisticsd
  - histograms
  - algorithms
    - LOGISTIC_REGRESSION
    - TTEST_INDEPENDENT
    - ID3
    - PEARSON_CORRELATION
    - LINEAR_REGRESSION
    - ANOVA
    - Naive Bayes with cross validation
- Removed unused visjs library

### 5.0.0 - 08.10.2019

- Navigation reworked
- Explore layout redesigned
- Removed lots of css, migrating to styled-components
- Galaxy iFrame integration
- multipathologies
- Exareme statistics replace Woken summary statistics
- Removed /v3 path
- React Login
- Re-enabled Bugsnag for production build
- Removed Angular
- Switched React Linter from TSLint to ESLint
  - See [ESLint and Prettier in a TypeScript Project](https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb)

### 4.0.0 - 05.07.2019

- Removed ID3 and Naive Bayes standalone ( => 5.0 )
- Histograms:
  - Local version with Woken
  - Federated version with Exareme
  - Galaxy Workflow Error handling
  - Exareme histograms error handling

### 4.0.0-beta.1 - 20.06.2019

- Galaxy Workflow POC
  - Naive Bayes
- Multi pathologies POC
- Exareme Algorithms integration
  - Pearson correlation
  - Histograms
  - Logistic regression
  - Anova
  - Naive Bayes
  - ID3
- EE page
  - Exareme Histograms
  - React/D3 hook architecture
- Local/central algorithm list
- Homepage draft (/v3/home)
- Types cleanup

### 3.0.4 - 29.05.2019

- Bug fixes

### 3.0.3 - 10.05.2019

- Enabled KNN
- Filter tests by plateform in CI, do `yarn test woken` or `yarn test exareme`

### 3.0.2 - 08.05.2019

- Fixed Mime type bug due to Mime type bug on on [Woken see](https://jira.chuv.ch/browse/HBPLD-256?filter=-6)
- Fixed config.mode for federation
- Removed Heatmaply (Too heavy ~7 mo)

### 3.0.1 - 08.05.2019

- Test suite can now run as a standalone docker to test any live installation, see [/app/v3/README.md](./app/v3/README.md)
- Fixed footer

### 3.0.0 - 30.04.2019

- Tag release, no changes

### 2.16.5 - 2019/04/08

- Highcharts to 6.1.0 (angular security fix)
- Reworked Heatmap test

### 2.16.4 - 2019/03/26

- Idem than 2.16.3 - Previous merge failed

### 2.16.3 - 2019/03/26

- Fixed CircleCI build & test
  - Exareme tests are disabled as datasets are not aligned ( can't save a model on the backend if the dataset doesn't exist)
  - However tests pass on web-anayltics-demo, branch research_datasets
  - To be fixed in Exareme integration
- Fixed Heatmap bug
- Reworked mining cache

### 2.16.2 - 2019/03/20

- Added test for exareme filters
- Added footer to Experiment pages
- default kfold value to 3

### 2.16.1 - 2019/03/19

- Removed validation for local mode
- Tests fixes
- Fixed kfold for kmeans

### 2.16.0 - 2019/03/13

- Algorithm tests completed, testing 20 algorithms (Woken, Exareme) see ./app/v3/src/components/API/**tests**/Integration/Experiments/README.txt
- Algorithm fixes
- Updated yarn libraries (react, highcharts)
- Various UI fixes (Dropdown, results)

### 2.15.8 - 2019/03/08

- Implemented Helpdesk forms (Angular, React)
- New Term of Services page

### 2.15.6 - 2019/02/25

- Quick implementation of linear regression from Exareme

### 2.15.5 - 2019/02/24

- UI fixes
- Fixed filter bug
- Fixed heatmap visualisation
- Libs; swaped numeral (buggy) for numbro
- Formatted linearRegression

### 2.15.4 - 2019/02/22

- Fixed filter query bug
- Modularized plotly.js -> -1.20 Mo on build
- Integration and e2e test for Heatmap API
- Fixed Heatmap formating bugs for federation
- [numeral](https://www.npmjs.com/package/numeral) lib added for scientific notation
- Fixed visualisation bug to Woken format (see HBPLD-256 in jira)
- More testing for linear regression federated, 1 or several datasets
- Updated react libs
- Fixed typing, imports, canvas testing, ansync tests
- [Migrated](https://vincenttunru.com/migrate-create-react-app-typescript-to-create-react-app/) from create-react-app-typescript to Create React App

### 2.15.3 2019/02/18

- Tests
  - Jest and Enzyme config for Typescript
  - `yarn test`
  - Render tests for top level components, App, Results, Create
  - API Integration tests for Model: create and update
  - E2E tests based on mocks, federated mode
    - naivebayes
    - linearregression
- React version
  - Updated all librairies to latest version
  - Added bugsnag client
  - Fixed kfold polynominal presponse processing bug
