import * as React from "react";
import { Provider } from "unstated";
import { Experiment, Navigation } from "../../components/";

import "./App.css";


class App extends React.Component {
  public render() {
    return (
      <Provider>
        <div className="App">
          <Navigation />
          <Experiment />
        </div>
      </Provider>
    );
  }
}

export default App;
