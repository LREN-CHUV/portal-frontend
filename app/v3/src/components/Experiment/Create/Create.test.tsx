import { APICore, APIExperiment, APIModel } from "@app/components/API";
import config from "@app/components/API/RequestHeaders";
import ExperimentCreate from "@app/components/Experiment/Create/Container";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import * as ReactDOM from "react-dom";

it("renders without crashing", () => {
  const apiExperiment = new APIExperiment(config);
  const apiModel = new APIModel(config);
  const apiCore = new APICore(config);

  const div = document.createElement("div");
  ReactDOM.render(
    <Router>
      <ExperimentCreate
        apiExperiment={apiExperiment}
        apiCore={apiCore}
        apiModel={apiModel}
      />
    </Router>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
