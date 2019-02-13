import { APICore, APIExperiment, APIModel } from "@app/components/API";
import config from "@app/components/API/RequestHeaders";
import ExperimentResult from "@app/components/Experiment/Result/Container";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import renderer from "react-test-renderer";
import * as ReactDOM from "react-dom";


jest.mock('__mocks__/model.json', ()=> ({
  settings: 'someSetting'
}), { virtual: true })

jest.mock("request-promise-native", () => ({

});

it("renders without crashing", () => {
    const apiExperiment = new APIExperiment(config);
    const apiModel = new APIModel(config);
    const apiCore = new APICore(config);
  
    const div = document.createElement("div");
    ReactDOM.render(
      <Router>
        <ExperimentResult
          apiExperiment={apiExperiment}
          apiCore={apiCore}
          apiModel={apiModel}
        />
      </Router>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });


