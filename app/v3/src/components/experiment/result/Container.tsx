// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ExperimentHeader, ExperimentResult, Model } from "../..";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../../../containers";

import "../Experiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  modelContainer: ModelContainer;
}

const methodDisplay = (experiment: IExperimentResult | undefined) => (
  <Panel>
    <Panel.Body>
      <h3>Methods</h3>
      {experiment &&
        experiment.algorithms.map((m: any) => <p key={m.code}>{m.name}</p>)}
      {experiment &&
        experiment.validations &&
        experiment.validations.length > 0 && <h3>Validation</h3>}
      {experiment &&
        experiment.validations &&
        experiment.validations.length > 0 &&
        experiment.validations.map((m: any) => (
          <p key={m.code}>
            {m.code}: {m.parameters.map((p: any) => p.value)}
          </p>
        ))}
    </Panel.Body>
  </Panel>
);

class Experiment extends React.Component<IProps> {
  public async componentDidMount() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return;
    }
    const { uuid, slug } = matched.params;
    const { experimentContainer, modelContainer } = this.props;

    await modelContainer.load(slug);
    return await experimentContainer.load(uuid);
  }

  public render() {
    const {
      experimentContainer,
      experimentListContainer,
      modelContainer
    } = this.props;
    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentHeader
            experimentContainer={experimentContainer}
            experiments={experimentListContainer.state.experiments}
          />
        </div>

        <div className="sidebar">
          {methodDisplay(experimentContainer.state.experiment)}
          <Model model={modelContainer.state.model} />
        </div>
        <div className="content">
          <ExperimentResult experimentState={experimentContainer.state} />
        </div>
      </div>
    );
  }
}

export default withRouter(Experiment);
