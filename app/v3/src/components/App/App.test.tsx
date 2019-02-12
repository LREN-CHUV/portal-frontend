import AppContainer from "@app/components/App/Container";
import * as React from "react";
import * as ReactDOM from "react-dom";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<AppContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});
