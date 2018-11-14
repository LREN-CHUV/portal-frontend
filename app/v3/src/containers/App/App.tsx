// import "./Bootstrap-custom.css"
// tslint:disable:no-console

import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import UNSTATED from "unstated-debug";
import { CoreDataContainer, ExperimentContainer, ModelContainer } from "../";
import {
  Bubble,
  Experiment,
  Experiments,
  Graph,
  Navigation,
  RunExperiment,
  TreeMap
} from "../../components";
import config from "../../config";

import "./App.css";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class App extends React.Component {
  private experimentContainer = new ExperimentContainer(config);
  private modelContainer = new ModelContainer(config);
  private exploreContainer = new CoreDataContainer(config);

  private intervalId: NodeJS.Timer;

  public async componentWillMount() {
    this.intervalId = setInterval(
      () => this.experimentContainer.all(),
      10 * 1000
    );
    this.experimentContainer.all()

    return await Promise.all([
      this.exploreContainer.variables(),
      this.exploreContainer.datasets(),
      this.exploreContainer.algorithms(),
      this.modelContainer.all(),
      // modelConstainer.one(slug)
    ]);
  }

  public componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  public render() {
    return (
      <Router>
        <Provider
          inject={[
            this.experimentContainer,
            this.exploreContainer,
            this.modelContainer
          ]}
        >
          <Subscribe
            to={[ExperimentContainer, CoreDataContainer, ModelContainer]}
          >
            {(
              experimentContainer: ExperimentContainer,
              exploreContainer: CoreDataContainer,
              modelContainer: ModelContainer
            ) => (
              <div className="App">
                <header>
                  <Navigation
                    experimentContainer={experimentContainer}
                    modelContainer={modelContainer}
                  />
                </header>
                <section>
                  <Route
                    path="/v3/explore"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <Bubble exploreContainer={exploreContainer} />
                    )}
                  />
                  <Route
                    path="/v3/explore1"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <TreeMap exploreContainer={exploreContainer} />
                    )}
                  />
                  <Route
                    path="/v3/explore2"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => <Graph exploreContainer={exploreContainer} />}
                  />
                  <Route
                    path="/v3/experiments"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <Experiments experimentContainer={experimentContainer} />
                    )}
                  />
                  <Route
                    path="/v3/experiment/:slug/:uuid"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <Experiment
                        experimentContainer={experimentContainer}
                        modelContainer={modelContainer}
                      />
                    )}
                  />
                  <Route
                    exact={true}
                    path="/v3/experiment/:slug"
                    // tslint:disable-next-line jsx-no-lambda
                    render={() => (
                      <RunExperiment
                        experimentContainer={experimentContainer}
                        exploreContainer={exploreContainer}
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
