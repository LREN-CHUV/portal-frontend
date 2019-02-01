import { APICore, APIExperiment, APIModel } from "@app/components/API";
import Form from "@app/components/Experiment/Create/Form";
import ExperimentCreateHeader from "@app/components/Experiment/Create/Header";
import { Alert, IAlert } from "@app/components/UI/Alert";
import AvailableMethods from "@app/components/UI/AvailableMethods";
import Model from "@app/components/UI/Model";
import Validation from "@app/components/UI/Validation";
import { MIP } from "@app/types";
import * as React from "react";
import { Panel, Tab, Tabs } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Help from "./Help";

import "../Experiment.css";
interface IProps extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

interface IState {
  parameters?: [MIP.API.IMethodPayload];
  query?: MIP.API.IQuery;
  method?: MIP.API.IMethod;
  alert: IAlert;
  kfold: number;
}

class Container extends React.Component<IProps, IState> {
  public state: IState;

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
    const { apiCore, apiModel, apiExperiment } = this.props;
    const alert = this.state && this.state.alert;
    const method = this.state && this.state.method;
    const isPredictiveMethod =
      (method && method.type && method.type[0] === "predictive_model") || false;

    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentCreateHeader
            model={apiModel.state.model}
            models={apiModel.state.models}
            experiments={apiExperiment.state.experiments}
            method={this.state && this.state.method}
            handleGoBackToReview={this.handleGoBackToReview}
            handleSelectModel={this.handleSelectModel}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Model
              model={apiModel.state.model}
              variables={apiCore.state.variables}
            />
          </div>
          <div className="parameters">
            <Panel>
              <Panel.Title>
                <h3>Your Experiment</h3>
              </Panel.Title>
              <Panel.Body>
                {alert && (
                  <Alert
                    message={alert.message}
                    title={alert.title}
                    style={alert.style}
                  />
                )}
                <Tabs
                  defaultActiveKey={1}
                  id="uncontrolled-create-experiment-tab"
                >
                  <Tab eventKey={1} title="Method">
                    <Form
                      method={this.state && this.state.method}
                      parameters={this.state && this.state.parameters}
                      kfold={this.state && this.state.kfold}
                      handleChangeParameters={this.handleChangeParameters}
                      handleChangeKFold={this.handleChangeKFold}
                    >
                      <fieldset style={{ padding: "8px" }}>
                        <Validation
                          isPredictiveMethod={isPredictiveMethod}
                          datasets={apiCore.state.datasets}
                          query={this.state && this.state.query}
                          handleUpdateQuery={this.handleUpdateQuery}
                        />
                      </fieldset>
                    </Form>
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
                <AvailableMethods
                  methods={apiCore.state.methods}
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
  private handleSelectModel = async (
    model: MIP.API.IModelResponse
  ): Promise<any> => {
    const { slug } = model;
    const { apiModel, history } = this.props;
    history.push(`/v3/experiment/${slug}`);
    if (slug) {
      return await apiModel.one(slug);
    }
  };

  private handleSelectMethod = (method: MIP.API.IMethod): void => {
    const parameters = method && method.parameters;
    this.setState({
      method,
      parameters
    });
  };

  private handleUpdateQuery = (query: MIP.API.IQuery): void => {
    this.setState({ query });
  };

  private handleChangeKFold = (kfold: number) => {
    this.setState({ kfold });
  };

  private handleChangeParameters = (parameters: [MIP.API.IMethodPayload]) => {
    this.setState({ parameters });
  };

  private handleSelectExperiment = async (
    experiment: MIP.API.IExperimentResponse
  ): Promise<any> => {
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

  private handleSaveAndRunExperiment = async (
    experimentName: string
  ): Promise<any> => {
    const { apiModel, apiExperiment, history } = this.props;

    if (!this.state) {
      this.setState({
        alert: {
          message: "An error occured, please try again later",
          style: "error",
          title: "Info"
        }
      });
      return;
    }
    const { query, parameters } = this.state;

    const model = apiModel.state.model;
    if (!model) {
      this.setState({
        alert: {
          message: "An error occured, please choose a model",
          style: "error",
          title: "Info"
        }
      });
      return;
    }

    const selectedMethod = this.state && this.state.method;
    model.query = query!;
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
              code: "kfold",
              name: "validation",
              parameters: [
                {
                  code: "k",
                  value: this.state.kfold
                }
              ]
            }
          ]
        : [];
    if (!model.slug) {
      this.setState({ alert: { message: "Model was not saved" } });
      return;
    }

    if (!selectedMethod) {
      this.setState({ alert: { message: "Select a method" } });
      return;
    }

    const experiment: MIP.API.IExperimentPayload = {
      algorithms: [
        {
          code: selectedMethod.code,
          name: selectedMethod.code,
          parameters: parameters
            ? parameters.map((p: any) => ({
                ...p,
                value: p.value || p.default_value
              }))
            : [],
          validation
        }
      ],
      model: model.slug,
      name: experimentName,
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
