import { APIExperiment, APIModel } from "@app/components/API";
import Model from "@app/components/UI/Model";
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ExperimentResult, ExperimentResultHeader } from "./";

interface IProps extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiModel: APIModel;
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
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid, slug } = params;
    const { apiExperiment, apiModel } = this.props;

    await apiExperiment.one(uuid);
    if (!apiExperiment.loaded) {
      this.pollFetchExperiment(uuid);
    }

    return await apiModel.one(slug);
  }

  public componentDidUpdate(prevProps: IProps) {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid } = params;
    const previousParams = this.urlParams(prevProps);
    const previousUUID = previousParams && previousParams.uuid;

    if (uuid !== previousUUID) {
      this.pollFetchExperiment(uuid);
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  public render() {
    const { apiExperiment, apiModel } = this.props;
    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentResultHeader
            experiment={apiExperiment.state.experiment}
            experiments={apiExperiment.state.experiments}
            handleSelectExperiment={this.handleSelectExperiment}
            handleCreateNewExperiment={this.handleCreateNewExperiment}
          />
        </div>
        <div className="sidebar2">
          <Model model={apiModel.state.model} />
        </div>
        <div className="content">
          <ExperimentResult experimentState={apiExperiment.state} />
        </div>
        <div className="sidebar">
          {methodDisplay(apiExperiment.state.experiment)}
        </div>
      </div>
    );
  }

  private urlParams = (
    props: IProps
  ):
    | {
        uuid: string;
        slug: string;
      }
    | undefined => {
    const { match } = props;
    if (!match) {
      return;
    }
    return match.params;
  };

  private handleSelectExperiment = async (
    selectedExperiment: IExperimentResult
  ) => {
    const { modelDefinitionId, uuid } = selectedExperiment;
    const { history, apiExperiment } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
    await apiExperiment.markAsViewed(uuid);
    return await apiExperiment.one(uuid);
  };

  private handleCreateNewExperiment = () => {
    const { history } = this.props;
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    history.push(`/v3/experiment/${params.slug}`);
  };

  private pollFetchExperiment = (uuid: string) => {
    clearInterval(this.intervalId);
    const { apiExperiment } = this.props;
    this.intervalId = setInterval(async () => {
      await apiExperiment.one(uuid);
      if (apiExperiment.loaded) {
        clearInterval(this.intervalId);
      }
    }, 10 * 1000);
  };
}

export default withRouter(Experiment);
