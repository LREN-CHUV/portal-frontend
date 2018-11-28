import { APICore, APIExperiment, APIModel } from "@app/components/API";
import ExperimentCreateHeader from "@app/components/Experiment/Create/Header";
import MethodParameters from "@app/components/Experiment/Create/MethodParameters";
import { Alert, IAlert } from "@app/components/UI/Alert";
import AvailableMethods from "@app/components/UI/AvailableMethods";
import UIModel from "@app/components/UI/Model";
import { IAlgorithm, IExperimentResult, IModelResult } from "@app/types";
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
  parameters?: object;
  model: IModelResult | undefined;
  method: IAlgorithm | undefined;
  alert: IAlert;
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

    return this.setState({ model: apiModel.state.model });
  }

  public componentWillReceiveProps = (props: any) => {
    const {
      apiModel: {
        state: { model }
      }
    } = props;

    return this.setState({ model });
  };

  public render() {
    const { apiCore, apiModel, apiExperiment } = this.props;
    const alert = this.state && this.state.alert;
    const title = apiModel.state.model && apiModel.state.model.title;

    return (
      <div className="Experiment">
        <div className="header">
          <ExperimentCreateHeader
            title={title}
            models={apiModel.state.models}
            experiments={apiExperiment.state.experiments}
            method={this.state && this.state.method}
            handleSelectModel={this.handleSelectModel}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <UIModel model={apiModel.state.model} />
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
                    <MethodParameters
                      apiExperiment={apiExperiment}
                      apiCore={apiCore}
                      model={this.state && this.state.model}
                      handleUpdateModel={this.handleUpdateModel}
                      nethod={this.state && this.state.method}
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
  private handleSelectModel = async (model: IModelResult): Promise<any> => {
    const { slug } = model;
    const { apiModel, history } = this.props;
    history.push(`/v3/experiment/${slug}`);

    return await apiModel.one(slug);
  };

  private handleSelectMethod = (method: IAlgorithm): void => {
    const methodParameters = (method && method.parameters) || undefined;

    const parameters = {};
    if (methodParameters) {
      methodParameters.forEach((p: any) => {
        parameters[p.code] = p.default_value;
      });
    }
    this.setState({
      method,
      parameters
    });
  };

  private handleUpdateModel = (model: IModelResult): void => {
    this.setState({ model });
  };

  private handleSelectExperiment = async (
    experiment: IExperimentResult
  ): Promise<any> => {
    const { modelDefinitionId, uuid } = experiment;
    const { apiExperiment, history } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);

    return await apiExperiment.one(uuid);
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
    const { model, parameters } = this.state;

    if (!model) {
      this.setState({
        alert: {
          message: "An error occured, pleae choose a model",
          style: "error",
          title: "Info"
        }
      });
      return;
    }

    const selectedMethod = this.state && this.state.method;
    if (!experimentName) {
      this.setState({
        alert: {
          message: "Please enter a name for the experiment",
          style: "info",
          title: "Info"
        }
      });
      return;
    }

    if (!selectedMethod) {
      this.setState({ alert: { message: "selectedMethod" } });
      return;
    }

    await apiModel.update(model);
    const validation =
      model &&
      model.query &&
      model.query.validationDatasets &&
      model.query.validationDatasets.length
        ? true
        : false;
    const exp = {
      algorithms: [
        {
          code: selectedMethod.code,
          name: selectedMethod.code,
          parameters: [parameters],
          validation
        }
      ],
      model: model.slug,
      name: experimentName,
      validations: []
    };

    let uuid;
    await apiExperiment.create(exp);
    const { experiment, error } = apiExperiment.state;

    if (error) {
      this.setState({
        alert: {
          message: `${error}`
        }
      });

      return;
    }

    uuid = experiment && experiment.uuid;

    history.push(`/v3/experiment/${model && model.slug}/${uuid}`);
  };
}

export default withRouter(Container);
