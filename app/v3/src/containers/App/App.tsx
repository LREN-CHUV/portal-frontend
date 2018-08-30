// import "./Bootstrap-custom.css"
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import UNSTATED from "unstated-debug";
import { Experiment, Experiments, Navigation } from "../../components";
import "./App.css";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class App extends React.Component {
  public render() {
    return (
      <Router>
        <div className="App">
          <header className="Navigation">
            <Navigation />
          </header>
          <section>
            <Route path="/v3/experiments" component={Experiments} />
            <Route path="/v3/experiment/:slug/:uuid" component={Experiment} />
          </section>
        </div>
      </Router>
    );
  }
}

export default App;
