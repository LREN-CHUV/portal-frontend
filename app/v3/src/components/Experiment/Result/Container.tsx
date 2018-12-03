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

const methodDisplay = (experiment: IExperimentResult | undefined) => {
  const algorithms = experiment && experiment.algorithms;
  const validations = experiment && experiment.validations;

  return (
    algorithms &&
    validations && (
      <Panel>
        <Panel.Body>
          <h3>Methods</h3>
          {algorithms.map((algorithm: any) => (
            <div>
              <p key={algorithm.code}>
                <strong>{algorithm.name}</strong>
              </p>
              {algorithm.parameters && algorithm.parameters.length > 0 && (
                <h3>Parameters</h3>
              )}
              {algorithm.parameters &&
                algorithm.parameters.length > 0 &&
                algorithm.parameters.map((m: any) => (
                  <p key={algorithm.code}>
                    {algorithm.code}: {algorithm.parameters.map((p: any) => p.value)}
                  </p>
                ))}
            </div>
          ))}
          {validations.length > 0 && <h3>Validation</h3>}
          {validations.length > 0 &&
            validations.map((m: any) => (
              <p key={m.code}>
                {m.code}: {m.parameters.map((p: any) => p.value)}
              </p>
            ))}
        </Panel.Body>
      </Panel>
    )
  );
};
class Experiment extends React.Component<IProps> {
  private intervalId: NodeJS.Timer;

  public async componentDidMount() {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid, slug } = params;
    const { apiExperiment, apiModel } = this.props;

    await apiExperiment.one({ uuid });
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
            handleShareExperiment={this.handleShareExperiment}
            handleCreateNewExperiment={this.handleCreateNewExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Model model={apiModel.state.model} />
          </div>
          <div className="results">
            <ExperimentResult experimentState={apiExperiment.state} />
          </div>
          <div className="sidebar2">
            {methodDisplay(apiExperiment.state.experiment)}
          </div>
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

  private handleSelectExperiment = async (experiment: IExperimentResult) => {
    const { modelDefinitionId, uuid } = experiment;
    const { history, apiExperiment } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
    await apiExperiment.markAsViewed({ uuid });
    return await apiExperiment.one({ uuid });
  };

  private handleShareExperiment = async () => {
    const { apiExperiment } = this.props;
    const experiment = apiExperiment.state.experiment;
    const shared = experiment && experiment.shared;
    const params = this.urlParams(this.props);

    if (!params) {
      return;
    }

    const { uuid } = params;
    return shared
      ? await apiExperiment.markAsUnshared({ uuid })
      : await apiExperiment.markAsShared({ uuid });
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
      await apiExperiment.one({ uuid });
      if (apiExperiment.loaded) {
        clearInterval(this.intervalId);
      }
    }, 10 * 1000);
  };
}

export default withRouter(Experiment);
