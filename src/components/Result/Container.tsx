import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ExperimentResult, ExperimentResultHeader } from '.';
import { APICore, APIExperiment, APIModel } from '../API';
import { ExperimentResponse } from '../API/Experiment';
import '../Experiment.css';
import Model from '../UI/Model';
import Algorithms from './Algorithms';

interface Props extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiModel: APIModel;
  apiCore: APICore;
}

class Experiment extends React.Component<Props> {
  private intervalId: any;

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

  public componentDidUpdate(prevProps: Props) {
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
    const { apiExperiment, apiModel, apiCore } = this.props;
    return (
      <div className="Experiment Result">
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
            <Model
              model={apiModel.state.model}
              showDatasets={true}
              lookup={apiCore.lookup}
            />
          </div>
          <div className="results">
            <ExperimentResult experimentState={apiExperiment.state} />
          </div>
          <div className="sidebar2">
            <Algorithms experiment={apiExperiment.state.experiment} />
          </div>
        </div>
      </div>
    );
  }

  private urlParams = (
    props: Props
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

  private handleSelectExperiment = async (experiment: ExperimentResponse) => {
    const { modelDefinitionId, uuid } = experiment;
    const { history, apiExperiment } = this.props;
    history.push(`/experiment/${modelDefinitionId}/${uuid}`);
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
    history.push(`/experiment`);
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
