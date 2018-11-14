// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ExperimentHeader, ExperimentResult, Model } from "../..";
import { ExperimentContainer, ModelContainer } from "../../../containers";

import "../Experiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
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
  private intervalId: NodeJS.Timer;

  public async componentDidMount() {
    const params = this.urlParams();
    if (!params) {
      return;
    }
    const { uuid, slug } = params;
    const { experimentContainer, modelContainer } = this.props;

    await experimentContainer.one(uuid);
    if (!experimentContainer.loaded) {
      this.pollFetchExperiment(uuid);
    }

    return await modelContainer.one(slug);
  }

  public componentDidUpdate(prevProps: IProps) {
    const params = this.urlParams();
    if (!params) {
      return;
    }
    const { uuid } = params;
    const previousId =
      prevProps &&
      prevProps.match &&
      prevProps.match.params &&
      prevProps.match.params.uuid;

    if (uuid !== previousId) {
      this.pollFetchExperiment(uuid);
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  public render() {
    const { experimentContainer, modelContainer } = this.props;
    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentHeader
            experiment={experimentContainer.state.experiment}
            experiments={experimentContainer.state.experiments}
            handleSelectExperiment={this.handleSelectExperiment}
            handleCreateNewExperiment={this.handleCreateNewExperiment}
          />
        </div>
        <div className="sidebar2">
          <Model model={modelContainer.state.model} />
        </div>
        <div className="content">
          <ExperimentResult experimentState={experimentContainer.state} />
        </div>
        <div className="sidebar">
          {methodDisplay(experimentContainer.state.experiment)}
        </div>
      </div>
    );
  }

  private urlParams = ():
    | {
        uuid: string;
        slug: string;
      }
    | undefined => {
    const { match } = this.props;
    if (!match) {
      return;
    }
    return match.params;
  };

  private handleSelectExperiment = async (
    selectedExperiment: IExperimentResult
  ) => {
    const { modelDefinitionId, uuid } = selectedExperiment;
    const { history, experimentContainer } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
    experimentContainer.markAsViewed(uuid);
  };

  private handleCreateNewExperiment = () => {
    const { history } = this.props;
    const params = this.urlParams();
    if (!params) { return }
    history.push(`/v3/experiment/${params.slug}`);
  };

  private pollFetchExperiment = (uuid: string) => {
    clearInterval(this.intervalId);
    const { experimentContainer } = this.props;
    this.intervalId = setInterval(async () => {
      await experimentContainer.one(uuid);
      const experiment = experimentContainer.state.experiment;
      if (experiment) {
        clearInterval(this.intervalId);
      }
    }, 10 * 1000);
  };
}

export default withRouter(Experiment);
