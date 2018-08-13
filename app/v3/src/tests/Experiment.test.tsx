import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "unstated";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { Experiment } from "../components";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider>
      <Router>
      <Experiment />
      </Router>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
