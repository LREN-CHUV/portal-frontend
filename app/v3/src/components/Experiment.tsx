// tslint:disable:no-console
import * as React from "react";
import { Panel } from "react-bootstrap";
import { match } from "react-router-dom";
import { Subscribe } from "unstated";
import { ExperimentContainer } from "../containers";
import { IExperimentResult } from "../types";
import { LoadExperiment } from "./";

import "./Experiment.css";

interface IExperimentParams {
  slug: string;
  uuid: string;
}

interface IExperimentProps {
  match?: match<IExperimentParams>;
}

const display = (experiment: IExperimentResult | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  return (
    <React.Fragment>
      <p>{experiment.name}</p>
      <p>{experiment.result.map(r => r.algorithm)}</p>
    </React.Fragment>
  );
};

class Experiment extends React.Component<IExperimentProps> {
  public render() {
    const { match: matched } = this.props;
    if (!matched) {
      return <p>Error, check you url</p>;
    }
    const { uuid } = matched.params;

    return (
      <Subscribe to={[ExperimentContainer]}>
        {(experimentContainer: ExperimentContainer) => (
          <React.Fragment>
            <LoadExperiment load={experimentContainer.load} uuid={uuid} />
            {experimentContainer.state.loading ? <h1>Loading...</h1> : null}
            {experimentContainer.state.error ? (
              <h1>{experimentContainer.state.error}</h1>
            ) : null}

            <Panel>
              <Panel.Title>Experiment</Panel.Title>
              <Panel.Body>
                {display(experimentContainer.state.experiment)}
              </Panel.Body>
            </Panel>
          </React.Fragment>
        )}
      </Subscribe>
    );
  }
}

export default Experiment;
