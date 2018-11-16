// import "./Bootstrap-custom.css"
// tslint:disable:no-console

import { APICore, APIExperiment, APIModel } from "@app/components/API";
import ExperimentCreate from "@app/components/Experiment/Create/Create";
import ExperimentResult from "@app/components/Experiment/Result/Result";
import Experiments from "@app/components/Experiments/Experiments";
import { ExploreBubble } from "@app/components/Explore";
import Navigation from "@app/components/UI/Navigation";
import config from "@app/config";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import UNSTATED from "unstated-debug";

import "./App.css";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class App extends React.Component {
  private apiExperiment = new APIExperiment(config);
  private apiModel = new APIModel(config);
  private apiCore = new APICore(config);

  private intervalId: NodeJS.Timer;

  public async componentWillMount() {
    this.intervalId = setInterval(() => this.apiExperiment.all(), 10 * 1000);

    return await Promise.all([
      this.apiExperiment.all(),
      this.apiCore.variables(),
      this.apiCore.datasets(),
      this.apiCore.algorithms(),
      this.apiModel.all()
    ]);
  }

  public componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  public render() {
    return (
      <Router>
        <Provider inject={[this.apiExperiment, this.apiCore, this.apiModel]}>
          <Subscribe to={[APIExperiment, APICore, APIModel]}>
            {(
              apiExperiment: APIExperiment,
              apiCore: APICore,
              apiModel: APIModel
            ) => (
              <div className="App">
                <header>
                  <Navigation
                    apiExperiment={apiExperiment}
                    apiModel={apiModel}
                  />
                </header>
                <section>
                  <Route
                    path="/v3/explore"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => <ExploreBubble apiCore={apiCore} />}
                  />
                  {/* <Route
                    path="/v3/explore1"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <TreeMap apiCore={apiCore} />
                    )}
                  />
                  <Route
                    path="/v3/explore2"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => <Graph apiCore={apiCore} />}
                  /> */}
                  <Route
                    path="/v3/experiments"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => <Experiments apiExperiment={apiExperiment} />}
                  />
                  <Route
                    path="/v3/experiment/:slug/:uuid"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <ExperimentResult
                        apiExperiment={apiExperiment}
                        apiModel={apiModel}
                      />
                    )}
                  />
                  <Route
                    exact={true}
                    path="/v3/experiment/:slug"
                    // tslint:disable-next-line jsx-no-lambda
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
            )}
          </Subscribe>
        </Provider>
      </Router>
    );
  }
}

export default App;
