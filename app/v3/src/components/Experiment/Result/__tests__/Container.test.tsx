import config from "@app/components/API/RequestHeaders";
import Container from "@app/components/Experiment/Result/Container";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import renderer from "react-test-renderer";
import * as ReactDOM from "react-dom";
import { APICore, APIExperiment, APIModel } from "@app/components/API";


jest.mock("request-promise-native");
it("renders without crashing", () => {
  const apiExperiment = new APIExperiment(config);
  const apiModel = new APIModel(config);
  const apiCore = new APICore(config);

  const div = document.createElement("div");
  ReactDOM.render(
    <Router>
      <Container
        apiExperiment={apiExperiment}
        apiCore={apiCore}
        apiModel={apiModel}
      />
    </Router>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
