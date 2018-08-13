import { App } from "@app/containers";
import { unregister } from "@app/registerServiceWorker";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";

import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
unregister();
