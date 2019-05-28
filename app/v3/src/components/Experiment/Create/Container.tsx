import '../Experiment.css';

import * as React from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APICore, APIExperiment, APIModel } from '../../API';
import { Method, MethodPayload } from '../../API/Core';
import { ExperimentPayload, ExperimentResponse } from '../../API/Experiment';
import { ModelResponse, Query } from '../../API/Model';
import { globalParameters } from '../../constants';
import Form from '../../Experiment/Create/Form';
import ExperimentCreateHeader from '../../Experiment/Create/Header';
import { Alert, IAlert } from '../../UI/Alert';
import AvailableMethods from '../../UI/AvailableMethods';
import Model from '../../UI/Model';
import Validation from '../../UI/Validation';
import Help from './Help';

interface Props extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  appConfig: any;
}

interface State {
  parameters?: [MethodPayload];
  query?: Query;
  method?: Method;
  alert: IAlert;
  kfold: number;
}

class Container extends React.Component<Props, State> {
  public state!: State; // TODO: double check init https://mariusschulz.com/blog/typescript-2-7-strict-property-initialization

  public async componentDidMount() {
    const {
      match: {
        params: { slug }
      }
    } = this.props;
    const { apiModel } = this.props;
    await apiModel.one(slug);

    return this.setState({
      query: apiModel.state.model && apiModel.state.model.query
    });
  }

  public componentWillReceiveProps = (props: any) => {
    const {
      apiModel: {
        state: { model }
      }
    } = props;

    return this.setState({ query: model ? model.query : undefined });
  };

  public render() {
    const { apiCore, apiModel, apiExperiment, appConfig } = this.props;
    const alert = this.state && this.state.alert;
    const method = this.state && this.state.method;
    const isLocal = (appConfig && appConfig.mode === 'local') || false;

    return (
      <div className='Experiment'>
        <div className='header'>
          <ExperimentCreateHeader
            model={apiModel.state.model}
            experiments={apiExperiment.state.experiments}
            method={this.state && this.state.method}
            handleGoBackToReview={this.handleGoBackToReview}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className='content'>
          <div className='sidebar'>
            <Model
              model={apiModel.state.model}
              showDatasets={true}
              variables={apiCore.state.variables}
              selectedSlug={this.props.match.params.slug}
              items={apiModel.state.models}
              handleSelectModel={this.handleSelectModel}
            />
          </div>
          <div className='parameters'>
            <Panel>
              <Panel.Title>
                <h3>Your Experiment</h3>
              </Panel.Title>
              <Panel.Body>
                {alert && <Alert message={alert.message} title={alert.title} styled={alert.styled} />}
                <Tabs defaultActiveKey={1} id='uncontrolled-create-experiment-tab'>
                  <Tab eventKey={1} title='Method'>
                    <Form
                      method={this.state && this.state.method}
                      parameters={this.state && this.state.parameters}
                      handleChangeParameters={this.handleChangeParameters}
                    />

                    <fieldset style={{ padding: '8px' }}>
                      <Validation
                        kfold={this.state && this.state.kfold}
                        handleChangeKFold={this.handleChangeKFold}
                        isLocal={isLocal}
                        isPredictiveMethod={this.isPredictiveMethod(method)}
                        datasets={apiCore.state.datasets}
                        query={this.state && this.state.query}
                        handleUpdateQuery={this.handleUpdateQuery}
                      />
                    </fieldset>
                  </Tab>
                  <Tab eventKey={2} title='About running experiments'>
                    <Help />
                  </Tab>
                </Tabs>
              </Panel.Body>
            </Panel>
          </div>
          <div className='sidebar2'>
            <Panel>
              <Panel.Title>
                <h3>Available Methods</h3>
              </Panel.Title>
              <Panel.Body>
                <AvailableMethods
                  methods={apiCore.state.methods}
                  exaremeAlgorithms={apiCore.state.exaremeAlgorithms}
                  variables={apiCore.state.variables}
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
  private isPredictiveMethod = (method: Method | undefined) =>
    (method && method.type && method.type[0] === 'predictive_model') || (method && method.code === 'kmeans') || false;

  private handleSelectModel = async (model?: ModelResponse): Promise<any> => {
    if (model) {
      const { slug } = model;
      const { apiModel, history } = this.props;
      history.push(`/v3/experiment/${slug}`);
      if (slug) {
        return await apiModel.one(slug);
      }
    }
  };

  private handleSelectMethod = (method: Method): void => {
    const kfold = this.isPredictiveMethod(method) ? globalParameters.kfold.k : 0;
    this.setState({
      kfold,
      method,
      parameters: method && method.parameters
    });
  };

  private handleUpdateQuery = (query: Query): void => {
    this.setState({ query });
  };

  private handleChangeKFold = (kfold: number) => {
    this.setState({ kfold });
  };

  private handleChangeParameters = (parameters: [MethodPayload]) => {
    this.setState({ parameters });
  };

  private handleSelectExperiment = async (experiment: ExperimentResponse): Promise<any> => {
    const { modelDefinitionId, uuid } = experiment;
    const { apiExperiment, history } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);

    return await apiExperiment.one({ uuid });
  };

  private handleGoBackToReview = () => {
    const { apiModel, history } = this.props;
    const model = apiModel.state.model;
    if (model) {
      history.push(`/v3/review/${model.slug}`);
    }
  };

  private handleSaveAndRunExperiment = async (experimentName: string): Promise<any> => {
    const { apiModel, apiExperiment, history } = this.props;

    if (!this.state) {
      this.setState({
        alert: {
          message: 'An error occured, please try again later',
          style: 'error',
          title: 'Info'
        }
      });
      return;
    }
    const { query, parameters } = this.state;

    const model = apiModel.state.model;
    if (!model) {
      this.setState({
        alert: {
          message: 'An error occured, please choose a model',
          style: 'error',
          title: 'Info'
        }
      });
      return;
    }

    const selectedMethod = this.state && this.state.method;
    model.query = query!;
    await apiModel.update({ model });

    const validation =
      model && model.query && model.query.validationDatasets && model.query.validationDatasets.length ? true : false;

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

    // FIXME: Exareme: temporary send model as x,y etc
    const params = [];
    if (selectedMethod.source === 'exareme') {
      let variableString;
      let covariablesArray: string[] = [];

      if (model.query.variables) {
        variableString = model.query.variables.map(v => v.code).toString();
      }

      if (model.query.coVariables) {
        covariablesArray = model.query.coVariables.map(v => v.code);
      }

      if (model.query.groupings) {
        covariablesArray = [...covariablesArray, ...model.query.groupings.map(v => v.code)];
      }

      let xCode = 'x';
      let yCode = 'y';

      switch (selectedMethod.code) {
        case 'VARIABLES_HISTOGRAM':
          xCode = 'column1';
          yCode = 'column2';
          break;
          break;

        case 'PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER':
        case 'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER':
          xCode = 'target_attributes';
          yCode = 'descriptive_attributes';
          break;

        default:
          break;
      }

      params.push({
        code: yCode,
        value: covariablesArray.toString()
      });

      params.push({
        code: xCode,
        value: variableString
      });

      const datasets = model.query.trainingDatasets;
      if (datasets) {
        const nextDatasets = datasets.map(v => v.code);
        params.push({
          code: 'dataset',
          value: nextDatasets.toString()
        });
      }
    }

    const newParams = parameters
      ? parameters.map((p: any) => ({
          ...p,
          value: p.value || p.default_value
        }))
      : [];

    const nextParams = params
      ? params.map((p: any) => ({
          ...p,
          value: p.value || p.default_value
        }))
      : newParams;

    const experiment: ExperimentPayload = {
      algorithms: [
        {
          code: selectedMethod.code,
          name: selectedMethod.code,
          parameters: [...nextParams, ...newParams],
          validation
        }
      ],
      model: model.slug,
      name: experimentName,
      source: selectedMethod.source,
      validations
    };

    let uuid;
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

    uuid = e && e.uuid;
    history.push(`/v3/experiment/${model && model.slug}/${uuid}`);
  };
}

export default withRouter(Container);
