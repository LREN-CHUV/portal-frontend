import * as React from "react";
import * as ReactDOM from "react-dom";
import { default as App } from "./components/App/App";
import "./index.css";
import { unregister } from "./registerServiceWorker";

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
unregister();
