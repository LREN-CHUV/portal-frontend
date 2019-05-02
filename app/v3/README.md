This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).


# Tests
docker build . -t hbpmip/portal-frontend-tests && docker run -it -e TOKEN="hello" -e JSESSIONID="world" --rm --network=webanalyticsstarter_default  hbpmip/portal-frontend-tests:latest

docker run -it -e BACKEND_URL="http://localhost:4480/services" -e TOKEN="988c5113-bfce-41ea-b8db-10e6284cac6b" -e JSESSIONID="B9980ED5FBA6B8305F680865E619F8A6" --rm hbpmip/portal-frontend-tests:latest
