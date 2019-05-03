# React MIP portal frontend

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Install

See [../../README.md](../../README.md)

## Tests

You can use the mip-fontend test suite against any live installation, either locally
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
