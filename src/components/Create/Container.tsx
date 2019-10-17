import '../Experiment.css';

import * as React from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APICore, APIExperiment, APIModel } from '../API';
import { Algorithm, AlgorithmParameter } from '../API/Core';
import { buildExaremeAlgorithmRequest } from '../API/ExaremeAPIAdapter';
import {
  Engine,
  ExperimentPayload,
  ExperimentResponse
} from '../API/Experiment';
import { ModelResponse, Query } from '../API/Model';
import { buildWorkflowAlgorithmRequest } from '../API/WorkflowAPIAdapter';
import { AppConfig, InstanceMode } from '../App/App';
import { globalParameters } from '../constants';
import { Alert, IAlert } from '../UI/Alert';
import Model from '../UI/Model';
import Validation from '../UI/Validation';
import AvailableAlgorithms from './AvailableAlgorithms';
import ExperimentCreateHeader from './Header';
import Help from './Help';
import Parameters from './Parameters';
import Datasets from '../UI/Datasets';

interface Props extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  appConfig: AppConfig;
}

interface State {
  parameters?: [AlgorithmParameter];
  method?: Algorithm;
  alert: IAlert;
  kfold: number;
}

class Container extends React.Component<Props, State> {
  public state!: State; // TODO: double check init https://mariusschulz.com/blog/typescript-2-7-strict-property-initialization

  public render(): JSX.Element {
    const { apiCore, apiModel, apiExperiment, appConfig } = this.props;
    const alert = this.state && this.state.alert;
    const method = this.state && this.state.method;
    const isLocal =
      (appConfig && appConfig.mode === InstanceMode.Local) || false;
    const query = apiModel.state.model && apiModel.state.model.query;

    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentCreateHeader
            model={apiModel.state.model}
            experiments={apiExperiment.state.experiments}
            method={this.state && this.state.method}
            handleGoBackToReview={this.handleGoBackToReview}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Datasets model={apiModel.state.model} />
            <Model
              model={apiModel.state.model}
              selectedSlug={apiModel.state.model && apiModel.state.model.slug}
              items={apiModel.state.models}
              handleSelectModel={this.handleSelectModel}
              lookup={apiCore.lookup}
            />
          </div>
          <div className="parameters">
            <Panel>
              <Panel.Body>
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
                  <Tab eventKey={1} title="Method">
                    <Parameters
                      method={this.state && this.state.method}
                      parameters={this.state && this.state.parameters}
                      handleChangeParameters={this.handleChangeParameters}
                      query={apiModel.state.model && apiModel.state.model.query}
                      apiCore={apiCore}
                    />

                    <fieldset style={{ padding: '8px' }}>
                      <Validation
                        kfold={this.state && this.state.kfold}
                        handleChangeKFold={this.handleChangeKFold}
                        isLocal={isLocal}
                        isPredictiveMethod={this.isPredictiveMethod(method)}
                        datasets={apiCore.datasetsForPathology(
                          query && query.pathology
                        )}
                        query={query}
                        handleUpdateQuery={this.handleUpdateQuery}
                      />
                    </fieldset>
                  </Tab>
                  <Tab eventKey={2} title="About running experiments">
                    <Help />
                  </Tab>
                </Tabs>
              </Panel.Body>
            </Panel>
          </div>
          <div className="sidebar2">
            <Panel>
              <Panel.Title>
                <h3>Available Methods</h3>
              </Panel.Title>
              <Panel.Body>
                <AvailableAlgorithms
                  isLocal={isLocal}
                  algorithms={apiCore.state.algorithms}
                  variables={apiCore.variablesForPathology(
                    apiModel.state.model && apiModel.state.model.query.pathology
                  )}
                  handleSelectMethod={this.handleSelectMethod}
                  model={apiModel.state.model}
                />
              </Panel.Body>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  // FIXME: better algorithm parameterization
  private isPredictiveMethod = (method: Algorithm | undefined) =>
    (method && method.type && method.type[0] === 'predictive_model') ||
    (method && method.code === 'kmeans') ||
    false;

  private handleSelectModel = async (model?: ModelResponse): Promise<any> => {
    if (model) {
      const { slug } = model;
      const { apiModel } = this.props;
      if (slug) {
        return await apiModel.one(slug);
      }
    }
  };

  private handleSelectMethod = (method: Algorithm): void => {
    const kfold = this.isPredictiveMethod(method)
      ? globalParameters.kfold.k
      : 0;
    this.setState({
      kfold,
      method,
      parameters: method && method.parameters
    });
  };

  private handleUpdateQuery = (query: Query): void => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    if (model) {
      model.query = query;
      apiModel.setModel(model);
    }
  };

  private handleChangeKFold = (kfold: number) => {
    this.setState({ kfold });
  };

  private handleChangeParameters = (parameters: [AlgorithmParameter]) => {
    this.setState({ parameters });
  };

  private handleSelectExperiment = async (
    experiment: ExperimentResponse
  ): Promise<any> => {
    const { modelDefinitionId, uuid } = experiment;
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
  ): Promise<any> => {
    const { apiModel, apiExperiment, history } = this.props;

    if (!this.state) {
      this.setState({
        alert: {
          message: 'An error occured, please try again later',
          styled: 'error',
          title: 'Info'
        }
      });
      return;
    }
    const { parameters } = this.state;

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

    const selectedMethod = this.state && this.state.method;
    await apiModel.update({ model });

    const validation =
      model &&
      model.query &&
      model.query.validationDatasets &&
      model.query.validationDatasets.length
        ? true
        : false;

    const validations =
      this.state.kfold > 0
        ? [
            {
              code: 'kfold',
              name: 'validation',
              parameters: [
                {
                  code: 'k',
                  value: this.state.kfold
                }
              ]
            }
          ]
        : [];
    if (!model.slug) {
      this.setState({ alert: { message: 'Model was not saved' } });
      return;
    }

    if (!selectedMethod) {
      this.setState({ alert: { message: 'Select a method' } });
      return;
    }

    const params = parameters
      ? parameters.map((p: any) => ({
          ...p,
          value: p.value || p.default_value
        }))
      : [];

    const requestParameters =
      selectedMethod.engine === Engine.Exareme
        ? buildExaremeAlgorithmRequest(model, selectedMethod, params)
        : selectedMethod.engine === Engine.Workflow
        ? buildWorkflowAlgorithmRequest(model, selectedMethod, params)
        : params;

    const experiment: ExperimentPayload = {
      algorithms: [
        {
          code: selectedMethod.code,
          name: selectedMethod.code,
          parameters: requestParameters,
          validation
        }
      ],
      engine: selectedMethod.engine,
      model: model.slug,
      name: experimentName,
      validations
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
