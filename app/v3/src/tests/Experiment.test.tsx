import { Experiment } from "@app/components";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "unstated";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider>
      <Experiment />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
