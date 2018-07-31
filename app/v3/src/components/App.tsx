import * as React from "react";
import "./App.css";

import { Experiment, Navigation } from "./";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Navigation />
        <Experiment />
      </div>
    );
  }
}

export default App;
