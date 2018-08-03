// tslint:disable: jsx-no-lambda
import * as React from "react";
import { Button, Panel } from "react-bootstrap";
import { Subscribe } from "unstated";
import { ExperimentContainer, ExperimentsContainer } from "../containers";
import "./Experiment.css";

class Experiment extends React.Component {
  public render() {
    return (
      <Subscribe to={[ExperimentContainer, ExperimentsContainer]}>
        {(
          experiment: ExperimentContainer,
          experiments: ExperimentsContainer
        ) => (
          <Panel>
            <Panel.Heading>
              <h3>
              Results of Experiment  <a>{experiment.state.name} </a>
              </h3>
              <Button onClick={experiments.load}>Load experiments</Button>
              {experiments.state.items
                ? experiments.state.items.map(e => (
                    <Button
                      key={e.uuid}
                      onClick={() => experiment.load(e.uuid)}
                    >
                      {e.name}
                    </Button>
                  ))
                : null}
            </Panel.Heading>
          </Panel>
        )}
      </Subscribe>
    );
  }
}

export default Experiment;
