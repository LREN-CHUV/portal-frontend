This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).


# Tests
docker build . -t hbpmip/portal-frontend-tests && docker run -it -e TOKEN="hello" -e JSESSIONID="world" --rm --network=webanalyticsstarter_default  hbpmip/portal-frontend-tests:latest



