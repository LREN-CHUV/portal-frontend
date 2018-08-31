// import "./Bootstrap-custom.css"
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "unstated";
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
  private experimentListContainer: ExperimentListContainer;
  private experimentContainer: ExperimentContainer;
  private modelContainer: ModelContainer;

  constructor(props: any) {
    super(props);
    this.experimentListContainer = new ExperimentListContainer();
    this.experimentContainer = new ExperimentContainer();
    this.modelContainer = new ModelContainer();
  }

  public async componentDidMount() {
    return await this.experimentListContainer.load();
  }

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
            this.experimentListContainer,
            this.experimentContainer,
            this.modelContainer
          ]}
        >
          <div className="App">
            <header className="Navigation">
              <Navigation experimentContainer={this.experimentContainer} />
            </header>
            <section>
              <Route path="/v3/experiments" component={Experiments} />
              <Route path="/v3/experiment/:slug/:uuid" component={Experiment} />
            </section>
          </div>
        </Provider>
      </Router>
    );
  }
}

export default App;
