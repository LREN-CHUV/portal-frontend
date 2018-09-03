// tslint:disable:no-console
import {
  IExperimentResult,
} from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ExperimentHeader, ExperimentResult, Model } from "../components";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";

import "./Experiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  modelContainer: ModelContainer;
}

const methodDisplay = (experiment: IExperimentResult | undefined) => (
  <Panel>
    <Panel.Title>
      <h3>Methods</h3>
    </Panel.Title>
    <Panel.Body>
      {experiment && experiment.algorithms.map((m: any) => <p key={m}>{m}</p>)}
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
          <div>
            {methodDisplay(experimentContainer.state.experiment)}
            <Model model={modelContainer.state.model} />
          </div>
        </div>
        <div className="content">
          <ExperimentResult experimentState={experimentContainer.state} />
        </div>
      </div>
    );
  }
}

export default withRouter(Experiment);
