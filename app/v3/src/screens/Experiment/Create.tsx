import { APICore, APIExperiment, APIModel } from "@app/components/API";
import ExperimentCreate from "@app/components/Experiment/Create/Create";
import ExperimentCreateHeader from "@app/components/Experiment/Create/Header";
import { Alert, IAlert } from "@app/components/UI/Alert";
import AvailableMethods from "@app/components/UI/AvailableMethods";
import UIModel from "@app/components/UI/Model";
import { IAlgorithm, IExperimentResult, IModelResult } from "@app/types";
import * as React from "react";
import { Panel, Tab, Tabs } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";

import "./Experiment.css";

interface IProps extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

interface IState {
  parameters?: object;
  model: IModelResult | undefined;
  selectedMethod: IAlgorithm | undefined;
  alert: IAlert;
}

class Create extends React.Component<IProps, IState> {
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
      <div className="Experiment RunExperiment">
        <div className="header">
          <ExperimentCreateHeader
            title={title}
            models={apiModel.state.models}
            experiments={apiExperiment.state.experiments}
            selectedMethod={this.state && this.state.selectedMethod}
            handleSelectModel={this.handleSelectModel}
            handleSelectExperiment={this.handleSelectExperiment}
            handleSaveAndRunExperiment={this.handleSaveAndRunExperiment}
          />
        </div>
        <div className="sidebar2">
          <UIModel model={apiModel.state.model} />
        </div>
        <div className="content">
          <Panel>
            <Panel.Title>
              <div className="flexbox">
                <h3 className="item">Your Experiment</h3>
              </div>
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
                  <ExperimentCreate
                    apiExperiment={apiExperiment}
                    apiCore={apiCore}
                    model={this.state && this.state.model}
                    handleUpdateModel={this.handleUpdateModel}
                    selectedMethod={this.state && this.state.selectedMethod}
                  />
                </Tab>
                <Tab eventKey={2} title="About running experiments">
                  <p>
                    An experiment is a set of algorithm(s) and their
                    configuration applied to the variables already selected. You
                    may choose same algorithms more than once providing that you
                    change the configuration parameters.
                  </p>
                  <p>
                    You can design your own MIP Experiment by doing the
                    following:
                  </p>
                  <ol>
                    <li>Select an algorithms on the right</li>
                    <li>If required, configure parameters (e.g. "k")</li>
                    <li>Give a name to the Experiment</li>
                    <li>
                      Select your k-fold Validation (to be applied to predictive
                      model algorithms)
                    </li>
                    <li>Run Experiment</li>
                    <li>Wait for results.</li>
                  </ol>
                </Tab>
              </Tabs>
            </Panel.Body>
          </Panel>
        </div>
        <div className="sidebar">
          <Panel>
            <Panel.Title>
              <h3>Available Methods</h3>
            </Panel.Title>
            <Panel.Body>
              <AvailableMethods
                apiCore={apiCore}
                handleSelectMethod={this.handleSelectMethod}
                model={apiModel.state.model}
              />
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
  private handleSelectModel = async (selectedModel: IModelResult) => {
    const { slug } = selectedModel;
    const { apiModel, history } = this.props;
    history.push(`/v3/experiment/${slug}`);

    return await apiModel.one(slug);
  };

  private handleSelectMethod = (event: any, selectedMethod: IAlgorithm) => {
    event.preventDefault();
    const methodParameters =
      (selectedMethod && selectedMethod.parameters) || undefined;

    const parameters = {};
    if (methodParameters) {
      methodParameters.forEach((p: any) => {
        parameters[p.code] = p.default_value;
      });
    }
    this.setState({
      parameters,
      selectedMethod
    });
  };

  private handleUpdateModel = (model: IModelResult) => {
    this.setState({ model });
  };

  private handleSelectExperiment = async (
    selectedExperiment: IExperimentResult
  ) => {
    const { modelDefinitionId, uuid } = selectedExperiment;
    const { apiExperiment, history } = this.props;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);

    return await apiExperiment.one(uuid);
  };

  private handleSaveAndRunExperiment = async (experimentName: string) => {
    const { apiModel, apiExperiment, history } = this.props;

    if (!this.state) {
      return;
    }
    const { model, parameters } = this.state;

    if (!model) {
      return;
    }

    const selectedMethod = this.state && this.state.selectedMethod;
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

export default withRouter(Create);
