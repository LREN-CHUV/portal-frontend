import * as React from "react";
import * as ReactDOM from "react-dom";
import { default as AppContainer } from "./components/App/Container";
import "./index.css";
import { unregister } from "./registerServiceWorker";

ReactDOM.render(<AppContainer />, document.getElementById("root") as HTMLElement);
unregister();
