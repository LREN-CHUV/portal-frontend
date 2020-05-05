# Testing installations

## FEDERATION test (mip.humanbrainproject.com)

### Configured with pathologies/datasets for mip.humanbrainproject.com (2020/04/21)

- Login to the [mip at https://mip.humanbrainproject.eu](https://mip.humanbrainproject.eu)
- Get your Token and SessionId in the browser (Developer tools -> Application -> Cookies)
- Reference the script below with correct parameters
- You can launch the script with `yarn test`
- Regex: pick your algorithm with `yarn test multiple`

`TOKEN=yourtoken; JSESSIONID=yoursession; docker run --rm -it -e TOKEN=${TOKEN} -e JSESSIONID=${JSESSIONID} -e BACKEND_URL=http://148.187.98.92 hbpmip/portal-frontend:testing-federated yarn test multiple`

## Test install from [mip-deployement](https://github.com/HBPMedical/mip-deployment) repository

- Same procedure but the docker image is different

`TOKEN=yourtoken; JSESSIONID=yoursession; docker run --rm -it -e TOKEN=${TOKEN} -e JSESSIONID=${JSESSIONID} -e BACKEND_URL=http://148.187.97.159 hbpmip/portal-frontend:testing-deployment yarn test multiple`

# Expected Output

PASS src/components/API/**tests**/Integration/ExaremeCart.test.tsx (94.219s)  
PASS src/components/API/**tests**/Integration/GalaxyNaiveBayesCrossValidation.test.tsx (68.621s)  
PASS src/components/API/**tests**/Integration/ExaremeMultipleHistograms.test.tsx (14.817s)  
PASS src/components/API/**tests**/Integration/Core.test.tsx  
PASS src/components/API/**tests**/Integration/ExaremeID3.test.tsx (95.13s)  
PASS src/components/API/**tests**/Integration/ExaremeHistograms.test.tsx (13.154s)  
Test Suites: 19 passed, 19 total  
Tests: 58 passed, 58 total  
Snapshots: 0 total  
Time: 219.955s
