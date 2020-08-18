import * as React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APICore, APIExperiment, APIModel } from '../API';
import {
  Algorithm,
  AlgorithmParameter,
  AlgorithmParameterRequest
} from '../API/Core';
import { ExperimentPayload, ExperimentResponse } from '../API/Experiment';
import { ModelResponse } from '../API/Model';
import { AppConfig } from '../App/App';
import { Alert, IAlert } from '../UI/Alert';
import LargeDatasetSelect from '../UI/LargeDatasetSelect';
import Model from '../UI/Model';
import AvailableAlgorithms from './AvailableAlgorithms';
import ExperimentCreateHeader from './Header';
import Help from './Help';
import Parameters from './Parameters';

interface Props extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  appConfig: AppConfig;
}

interface State {
  parameters?: AlgorithmParameter[];
  algorithm?: Algorithm;
  alert: IAlert;
}

class Container extends React.Component<Props, State> {
  public state!: State;

  public render(): JSX.Element {
    const { apiCore, apiModel, apiExperiment } = this.props;
    const alert = this.state && this.state.alert;
    const query = apiModel.state.model && apiModel.state.model.query;
    const pathology = query?.pathology || '';
    const datasets = apiCore.state.pathologiesDatasets[pathology];

    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentCreateHeader
            model={apiModel.state.model}
            experiments={apiExperiment.state.experiments}
            method={this.state && this.state.algorithm}
            handleGoBackToReview={this.handleGoBackToReview}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Card className="datasets">
              <Card.Body>
                {query?.pathology && (
                  <section>
                    <h4>Pathology</h4>
                    <p>{query?.pathology || ''}</p>
                  </section>
                )}

                {datasets && (
                  <section>
                    <LargeDatasetSelect
                      datasets={datasets}
                      handleSelectDataset={apiModel.selectDataset}
                      selectedDatasets={query?.trainingDatasets || []}
                    ></LargeDatasetSelect>
                  </section>
                )}

                <section>
                  <Model
                    model={apiModel.state.model}
                    selectedSlug={
                      apiModel.state.model && apiModel.state.model.slug
                    }
                    items={apiModel.state.models}
                    handleSelectModel={this.handleSelectModel}
                    lookup={apiCore.lookup}
                  />
                </section>
              </Card.Body>
            </Card>
          </div>
          <div className="parameters">
            <Card>
              <Card.Body>
                {alert && (
                  <Alert
                    message={alert.message}
                    title={alert.title}
                    styled={alert.styled}
                  />
                )}
                <Tabs
                  defaultActiveKey={1}
                  id="uncontrolled-create-experiment-tab"
                >
                  <Tab eventKey={'1'} title="Algorithm">
                    <Parameters
                      algorithm={this.state && this.state.algorithm}
                      parameters={this.state && this.state.parameters}
                      handleChangeParameters={this.handleChangeParameters}
                      query={apiModel.state.model && apiModel.state.model.query}
                      apiCore={apiCore}
                    />
                  </Tab>
                  <Tab eventKey={'2'} title="About running experiments">
                    <Help />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </div>
          <div className="sidebar2">
            <Card>
              <Card.Body>
                <h4>Available Algorithms</h4>
                <AvailableAlgorithms
                  algorithms={apiCore.state.algorithms}
                  lookup={apiCore.lookup}
                  handleSelectMethod={this.handleSelectAlgorithm}
                  apiModel={apiModel}
                />
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  private handleSelectModel = async (model?: ModelResponse): Promise<void> => {
    if (model) {
      const { slug } = model;
      const { apiModel, apiCore } = this.props;
      if (slug) {
        return await apiModel.one(model.slug).then(() => {
          const pathology = apiModel.state.model?.query?.pathology || '';
          apiModel.checkModelDatasets(
            apiCore.state.pathologiesDatasets[pathology]
          );
        });
      }
    }
  };

  private handleSelectAlgorithm = (algorithm: Algorithm): void => {
    this.setState({
      algorithm: algorithm,
      parameters: algorithm && (algorithm.parameters as AlgorithmParameter[])
    });
  };

  private handleChangeParameters = (parameters: AlgorithmParameter[]): void => {
    this.setState({ parameters });
  };

  private handleSelectExperiment = async (
    experiment: ExperimentResponse
  ): Promise<void> => {
    const { modelSlug: modelDefinitionId, uuid } = experiment;
    const { apiExperiment, history } = this.props;
    history.push(`/experiment/${modelDefinitionId}/${uuid}`);

    return await apiExperiment.one({ uuid });
  };

  private handleGoBackToReview = (): void => {
    const { history } = this.props;
    history.push(`/review`);
  };

  private handleSaveAndRunExperiment = async (
    experimentName: string
  ): Promise<void> => {
    const { apiModel, apiExperiment, history } = this.props;

    const model = apiModel.state.model;
    if (!model) {
      this.setState({
        alert: {
          message: 'An error occured, please choose a model',
          styled: 'error',
          title: 'Info'
        }
      });
      return;
    }

    await apiModel.update({ model });
    if (!model.slug) {
      this.setState({ alert: { message: 'Model was not saved' } });
      return;
    }
    const selectedAlgorithm = this.state && this.state.algorithm;
    const { parameters } = this.state;

    if (!selectedAlgorithm || !parameters) {
      this.setState({ alert: { message: 'Select an algorithm' } });
      return;
    }

    const nextParameters: AlgorithmParameterRequest[] = apiExperiment.makeParameters(
      model,
      selectedAlgorithm,
      parameters
    );

    const experiment: ExperimentPayload = {
      algorithms: [
        {
          label: selectedAlgorithm.label,
          name: selectedAlgorithm.name,
          parameters: nextParameters,
          type: selectedAlgorithm.type
        }
      ],
      model: model.slug,
      label: selectedAlgorithm.label,
      name: experimentName
    };

    await apiExperiment.create({ experiment });
    const { experiment: e, error } = apiExperiment.state;

    if (error) {
      this.setState({
        alert: {
          message: `${error}`
        }
      });

      return;
    }

    const uuid = (e && e.uuid) || '';
    history.push(`/experiment/${model && model.slug}/${uuid}`);
  };
}

export default withRouter(Container);
