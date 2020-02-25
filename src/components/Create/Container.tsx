import * as React from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { APICore, APIExperiment, APIModel } from '../API';
import {
  Algorithm,
  AlgorithmParameter,
  AlgorithmParameterRequest
} from '../API/Core';
import { ExperimentPayload, ExperimentResponse } from '../API/Experiment';
import { ModelResponse, Query } from '../API/Model';
import { AppConfig } from '../App/App';
import '../Experiment.css';
import { Alert, IAlert } from '../UI/Alert';
import DatasetsForm from '../UI/DatasetsForm';
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
  public state!: State; // TODO: double check init https://mariusschulz.com/blog/typescript-2-7-strict-property-initialization

  public render(): JSX.Element {
    const { apiCore, apiModel, apiExperiment } = this.props;
    const alert = this.state && this.state.alert;
    const query = apiModel.state.model && apiModel.state.model.query;

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
            <Panel className="datasets">
              <Panel.Body>
                <DatasetsForm
                  datasets={apiCore.datasetsForPathology(
                    query && query.pathology
                  )}
                  query={query}
                  handleUpdateQuery={this.handleUpdateQuery}
                />
              </Panel.Body>
            </Panel>
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
                  <Tab eventKey={1} title="Algorithm">
                    <Parameters
                      algorithm={this.state && this.state.algorithm}
                      parameters={this.state && this.state.parameters}
                      handleChangeParameters={this.handleChangeParameters}
                      query={apiModel.state.model && apiModel.state.model.query}
                      apiCore={apiCore}
                    />
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
                <h3>Available Algorithms</h3>
              </Panel.Title>
              <Panel.Body>
                <AvailableAlgorithms
                  algorithms={apiCore.state.algorithms}
                  lookup={apiCore.lookup}
                  handleSelectMethod={this.handleSelectAlgorithm}
                  model={apiModel.state.model}
                />
              </Panel.Body>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  private handleSelectModel = async (model?: ModelResponse): Promise<any> => {
    if (model) {
      const { slug } = model;
      const { apiModel } = this.props;
      if (slug) {
        return await apiModel.one(slug);
      }
    }
  };

  private handleSelectAlgorithm = (algorithm: Algorithm): void => {
    this.setState({
      algorithm: algorithm,
      parameters: algorithm && (algorithm.parameters as AlgorithmParameter[])
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

  private handleChangeParameters = (parameters: AlgorithmParameter[]) => {
    this.setState({ parameters });
  };

  private handleSelectExperiment = async (
    experiment: ExperimentResponse
  ): Promise<any> => {
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
    if (!selectedAlgorithm) {
      this.setState({ alert: { message: 'Select an algorithm' } });
      return;
    }

    const { parameters } = this.state;
    if (!parameters) {
      this.setState({ alert: { message: 'Select an algorithm' } });
      return;
    }

    const nextParameters: AlgorithmParameterRequest[] = parameters.map(p => {
      let value: string = p.value;
      const query = model && model.query;

      if (query) {
        if (p.label === 'x') {
          let covariablesArray =
            (query.coVariables && query.coVariables.map(v => v.code)) || [];
          covariablesArray = query.groupings
            ? [...covariablesArray, ...query.groupings.map(v => v.code)]
            : covariablesArray;

          if (covariablesArray.length > 0) {
            const design = parameters.find(p => p.name === 'design');
            if (design) {
              value =
                design.value === 'additive'
                  ? covariablesArray.toString().replace(/,/g, '+')
                  : covariablesArray.toString().replace(/,/g, '*');
            } else {
              value = covariablesArray.toString();
            }
          }
        }

        if (p.label === 'y') {
          // TEST_PAIRED
          // TODO: this will be replaced by the formula field and should be removed when it occurs
          const isVector = selectedAlgorithm.name === 'TTEST_PAIRED';
          const varCount = (query.variables && query.variables.length) || 0;
          value = isVector
            ? (query.variables &&
                query.variables // outputs: a1-a2,b1-b2, c1-a1
                  .reduce(
                    (vectors: string, v, i) =>
                      (i + 1) % 2 === 0
                        ? `${vectors}${v.code},`
                        : varCount === i + 1
                        ? `${vectors}${v.code}-${query.variables &&
                            query.variables[0].code}`
                        : `${vectors}${v.code}-`,
                    ''
                  )
                  .replace(/,$/, '')) ||
              ''
            : (query.variables &&
                query.variables.map(v => v.code).toString()) ||
              '';
        }

        if (p.label === 'dataset') {
          value =
            (query.trainingDatasets &&
              query.trainingDatasets.map(v => v.code).toString()) ||
            '';
        }

        if (p.label === 'pathology') {
          value = (query.pathology && query.pathology.toString()) || '';
        }

        if (p.label === 'filter') {
          value = (query.filters && query.filters) || '';
        }
      }

      return {
        name: p.name,
        label: p.label,
        value
      };
    });
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
