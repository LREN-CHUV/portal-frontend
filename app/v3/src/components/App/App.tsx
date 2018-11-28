// tslint:disable jsx-no-lambda

import { APICore, APIExperiment, APIModel } from "@app/components/API";
import ExperimentCreate from "@app/components/Experiment/Create/Container";
import ExperimentResult from "@app/components/Experiment/Result/Container";
import Experiments from "@app/components/Experiments/Experiments";
import Explore from "@app/components/Explore/NativeBubble";
import Navigation from "@app/components/UI/Navigation";
import * as React from "react";
import { Route } from "react-router-dom";

import "node_modules/bootstrap/dist/css/bootstrap.css";
import "./App.css";

interface IProps {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

const App = ({ apiExperiment, apiCore, apiModel }: IProps) => (
  <div className="App">
    <header>
      <Navigation apiExperiment={apiExperiment} apiModel={apiModel} />
    </header>
    <section>
      <Route path="/v3/explore" render={() => <Explore apiCore={apiCore} />} />
      <Route
        path="/v3/experiments"
        render={() => <Experiments apiExperiment={apiExperiment} />}
      />
      <Route
        path="/v3/experiment/:slug/:uuid"
        render={() => (
          <ExperimentResult apiExperiment={apiExperiment} apiModel={apiModel} />
        )}
      />
      <Route
        exact={true}
        path="/v3/experiment/:slug"
        render={() => (
          <ExperimentCreate
            apiExperiment={apiExperiment}
            apiCore={apiCore}
            apiModel={apiModel}
          />
        )}
      />
    </section>
  </div>
);

export default App;
