import * as React from "react";
import { Panel } from "react-bootstrap";

import "./Experiment.css";

class Experiment extends React.Component {
  public render() {
    return (
      <div>
        <Panel>
          <Panel.Heading>
            <h3>
              Run an Experiment on <a>model.title</a>
            </h3>
          </Panel.Heading>
        </Panel>
      </div>
    );
  }
}

export default Experiment;
