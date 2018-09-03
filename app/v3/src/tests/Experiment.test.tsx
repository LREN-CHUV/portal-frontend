import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";

import { Experiment } from "../components";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Router>
      <Provider
        inject={[
          new ExperimentContainer(),
          new ExperimentListContainer(),
          new ModelContainer()
        ]}
      >
        <Subscribe
          to={[ExperimentContainer, ExperimentListContainer, ModelContainer]}
        >
          {(
            experimentContainer: ExperimentContainer,
            experimentListContainer: ExperimentListContainer,
            modelContainer: ModelContainer
          ) => (
            <Experiment
              experimentContainer={experimentContainer}
              experimentListContainer={experimentListContainer}
              modelContainer={modelContainer}
            />
          )}
        </Subscribe>
      </Provider>
    </Router>,

    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
