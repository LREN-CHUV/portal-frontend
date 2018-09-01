// import "./Bootstrap-custom.css"
// tslint:disable:no-console

import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../";

import UNSTATED from "unstated-debug";
import { Experiment, Experiments, Navigation } from "../../components";

import "./App.css";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class App extends React.Component {
  private experimentControler = new ExperimentContainer();
  private experimentListContainer = new ExperimentListContainer();
  private modelContainer = new ModelContainer();
  // public async componentWillReceiveProps() {
  //   const { match: matched } = this.props;
  //   if (!matched) {
  //     return;
  //   }
  //   const { uuid, slug } = matched.params;
  //   await this.experimentContainer.load(uuid);
  //   return await this.modelContainer.load(slug);
  // }

  public render() {
    return (
      <Router>
        <Provider
          inject={[
            this.experimentControler,
            this.experimentListContainer,
            this.modelContainer
          ]}
        >
          <Subscribe
            to={[ExperimentContainer, ExperimentListContainer, ModelContainer]}
          >
            {(
              experimentContainer: any,
              experimentListContainer: any,
              modelContainer: any
            ) => (
              <div className="App">
                <header className="Navigation">
                  <Navigation
                    experimentContainer={experimentContainer}
                    experimentListContainer={experimentListContainer}
                    modelContainer={modelContainer}
                  />
                </header>
                <section>
                  <Route
                    path="/v3/experiments"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <Experiments
                        experimentContainer={experimentContainer}
                        experimentListContainer={experimentListContainer}
                      />
                    )}
                  />

                  <Route
                    path="/v3/experiment/:slug/:uuid"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <Experiment
                        experimentContainer={experimentContainer}
                        experimentListContainer={experimentListContainer}
                        modelContainer={modelContainer}
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
