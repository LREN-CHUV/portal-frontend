import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./containers";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";

import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
registerServiceWorker();
