import {
  APICore,
  APIExperiment,
  APIMining,
  APIModel
} from "@app/components/API";
import config from "@app/components/API/RequestHeaders";
import App from "@app/components/App/App";
import AppContainer from "@app/components/App/Container";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

jest.mock("request-promise-native");

const apiExperiment = new APIExperiment(config);
const apiModel = new APIModel(config);
const apiCore = new APICore(config);
const apiMining = new APIMining(config);

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<AppContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Router>
      <App
        appConfig={{ appConfig: "MIP" }}
        apiExperiment={apiExperiment}
        apiCore={apiCore}
        apiModel={apiModel}
        apiMining={apiMining}
      />
    </Router>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
