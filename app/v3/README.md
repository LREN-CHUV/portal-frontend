This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

# Tests

```
docker build . -f Dockerfile-test -t hbpmip/portal-frontend-tests
```

```
docker run -it -e BACKEND_URL="https://demo.mip.chuv.ch" \
-e TOKEN="xxx" \
-e JSESSIONID="xxx" \
-e AUTHORIZATION="Basic xxx" \
--rm hbpmip/portal-frontend-tests
```
