// import "./Bootstrap-custom.css"
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "unstated";
import { ExperimentListContainer } from "../";

import UNSTATED from "unstated-debug";
import { Experiment, Experiments, Navigation } from "../../components";

import "./App.css";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class App extends React.Component {
  private experimentListContainer: ExperimentListContainer;

  constructor(props: any) {
    super(props);
    this.experimentListContainer = new ExperimentListContainer();
  }

  public async componentDidMount() {
    return await this.experimentListContainer.load();
  }

  public render() {
    return (
      <Router>
        <Provider inject={[this.experimentListContainer]}>
          <div className="App">
            <header className="Navigation">
              <Navigation />
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
