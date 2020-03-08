import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ExperimentResult, ExperimentResultHeader } from '.';
import { APICore, APIExperiment, APIModel } from '../API';
import { ExperimentResponse } from '../API/Experiment';
import '../Experiment.css';
import Model from '../UI/Model';
import Algorithms from './Algorithms';
import Datasets from '../UI/Datasets';

interface RouteParams {
  uuid: string;
  slug: string;
}

interface Props extends RouteComponentProps<RouteParams> {
  apiExperiment: APIExperiment;
  apiModel: APIModel;
  apiCore: APICore;
}

class Experiment extends React.Component<Props> {
  private intervalId: any;

  public async componentDidMount(): Promise<void> {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid, slug } = params;
    const { apiExperiment, apiModel } = this.props;

    await apiExperiment.one({ uuid });
    if (!apiExperiment.loaded()) {
      this.pollFetchExperiment(uuid);
    }

    return await apiModel.one(slug);
  }

  public async componentDidUpdate(prevProps: Props): Promise<void> {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid, slug } = params;
    const previousParams = this.urlParams(prevProps);
    const previousUUID = previousParams && previousParams.uuid;
    const previousSlug = previousParams && previousParams.slug;

    if (slug !== previousSlug) {
      const { apiModel } = this.props;
      await apiModel.one(slug);
    }

    const { apiExperiment } = this.props;
    if (uuid !== previousUUID) {
      await apiExperiment.one({ uuid });
      if (!apiExperiment.loaded()) {
        this.pollFetchExperiment(uuid);
      }
    } else {
      if (apiExperiment.loaded()) {
        clearInterval(this.intervalId);
      }
    }
  }

  public componentWillUnmount(): void {
    clearInterval(this.intervalId);
  }

  public render(): JSX.Element {
    const { apiExperiment, apiModel, apiCore } = this.props;
    return (
      <div className="Experiment Result">
        {/* <div className="header">
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
            <Datasets model={apiModel.state.model} />
            <Model model={apiModel.state.model} lookup={apiCore.lookup} />
            <Algorithms experiment={apiExperiment.state.experiment} />
          </div> */}
        <div className="results">
          <ExperimentResult experimentState={apiExperiment.state} />
          {/* </div> */}
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

  private handleSelectExperiment = async (
    experiment: ExperimentResponse
  ): Promise<void> => {
    const { modelSlug: modelDefinitionId, uuid } = experiment;
    const { history, apiExperiment } = this.props;
    history.push(`/experiment/${modelDefinitionId}/${uuid}`);
    await apiExperiment.markAsViewed({ uuid });
    return await apiExperiment.one({ uuid });
  };

  private handleShareExperiment = async (): Promise<void> => {
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

  private handleCreateNewExperiment = (): void => {
    const { history } = this.props;
    history.push(`/experiment`);
  };

  private pollFetchExperiment = (uuid: string): void => {
    clearInterval(this.intervalId);
    const { apiExperiment } = this.props;
    this.intervalId = setInterval(async () => {
      await apiExperiment.one({ uuid });
      if (apiExperiment.loaded()) {
        clearInterval(this.intervalId);
      }
    }, 10 * 1000);
  };
}

export default withRouter(Experiment);
