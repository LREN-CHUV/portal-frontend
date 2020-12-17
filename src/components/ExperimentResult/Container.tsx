import * as React from 'react';
import { Card } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APICore, APIExperiment, APIModel } from '../API';
import { IExperiment } from '../API/Experiment';
import Datasets from '../UI/Datasets';
import Model from '../UI/Model';
import { ExperimentResult, ExperimentResultHeader } from '.';
import Algorithms from './Algorithms';

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

  async componentDidMount(): Promise<void> {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid } = params;
    const { apiExperiment } = this.props;

    const experiment = await apiExperiment.one({ uuid });
    if (!apiExperiment.loaded()) {
      this.pollFetchExperiment(uuid);
    }

    return experiment;
  }

  async componentDidUpdate(prevProps: Props): Promise<void> {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { uuid } = params;
    const previousParams = this.urlParams(prevProps);
    const previousUUID = previousParams && previousParams.uuid;

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

  componentWillUnmount(): void {
    clearInterval(this.intervalId);
  }

  render(): JSX.Element {
    const { apiExperiment, apiModel, apiCore } = this.props;
    const model = apiModel?.state?.model;
    return (
      <div className="Experiment Result">
        <div className="header">
          <ExperimentResultHeader
            experiment={apiExperiment.state.experiment}
            experimentList={apiExperiment.state.experimentList}
            handleSelectExperiment={this.handleSelectExperiment}
            handleShareExperiment={this.handleShareExperiment}
            handleCreateNewExperiment={this.handleCreateNewExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Card>
              <Card.Body>
                {model?.query?.pathology && (
                  <section>
                    <h4>Pathology</h4>
                    <p>{model?.query?.pathology || ''}</p>
                  </section>
                )}
                <section>
                  <Datasets model={model} />
                </section>
                <section>
                  <Algorithms experiment={apiExperiment.state.experiment} />
                </section>
                <section>
                  <Model model={model} lookup={apiCore.lookup} />
                </section>
              </Card.Body>
            </Card>
          </div>
          <div className="results">
            <ExperimentResult experimentState={apiExperiment.state} />
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

  private handleSelectExperiment = async (
    experiment: IExperiment
  ): Promise<void> => {
    const { uuid } = experiment;
    const { history, apiExperiment } = this.props;
    history.push(`/experiment/${uuid}`);
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
