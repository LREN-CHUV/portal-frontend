// tslint:disable:no-console
import { IModelResult } from "@app/types";
import * as React from "react";
import {
  Checkbox,
  Col,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Panel,
  Tab,
  Tabs
} from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Model } from "../..";
import {
  CoreDataContainer,
  ExperimentContainer,
  ModelContainer
} from "../../../containers";
import Alert from "../../Alert";

import "../Experiment.css";
import Header from "./Header";

enum DatasetType {
  Training,
  Validation,
  Test
}

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  exploreContainer: CoreDataContainer;
  modelContainer: ModelContainer;
}

interface IState {
  experimentName: string;
  selectedMethod: any | undefined;
  parameters: object;
  model: IModelResult | undefined;
  showAlert: boolean;
  alertMessage: string;
}

class Experiment extends React.Component<IProps, IState> {
  public state: IState = {
    alertMessage: '',
    experimentName: "",
    model: undefined,
    parameters: {},
    selectedMethod: undefined,
    showAlert: false
  };

  constructor(props: IProps) {
    super(props);
    this.handleChangeExperimentName = this.handleChangeExperimentName.bind(
      this
    );
  }

  public async componentDidMount() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return;
    }
    const { slug } = matched.params;
    const { exploreContainer, modelContainer } = this.props;
    await Promise.all([
      exploreContainer.variables(),
      exploreContainer.datasets(),
      exploreContainer.algorithms(),
      modelContainer.all(),
      modelContainer.one(slug)
    ]);

    return this.setState({
      model: modelContainer.state.model
    });
  }

  public componentWillReceiveProps = (props: any) => {
    const { modelContainer } = props;
    return this.setState({
      model: modelContainer.state.model
    });
  };

  public render() {
    const { model } = this.state;
    const {
      experimentContainer,
      exploreContainer,
      modelContainer
    } = this.props;

    const methods =
      exploreContainer &&
      exploreContainer.state &&
      exploreContainer.state.methods;

    const apiVariables = exploreContainer.state.variables;
    const datasets = exploreContainer.state.datasets;
    const query = model && model.query;
    const modelVariable =
      query && query.variables && query.variables.map(v => v.code)[0];
    const modelCovariables =
      (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
    const modelGroupings =
      (query && query.groupings && query.groupings.map(v => v.code)) || [];

    const { selectedMethod } = this.state;
    const parameters =
      (selectedMethod && selectedMethod.parameters) || undefined;
    const isPredictiveMethod =
      (selectedMethod && selectedMethod.type[0] === "predictive_model") ||
      false;

    return (
      <div className="Experiment RunExperiment">
        <div className="header">
          <Header
            handleSaveAndRunExperiment={this.handleSaveModelAndRunExperiment}
            handleChangeExperimentName={this.handleChangeExperimentName}
            selectedMethod={selectedMethod}
            experimentName={this.state.experimentName}
            experimentContainer={experimentContainer}
            modelContainer={modelContainer}
          />
        </div>
        <div className="sidebar2">
          <Model model={model} />
        </div>
        <div className="sidebar">
          <Panel>
            <Panel.Title>
              <h3>Available Methods</h3>
            </Panel.Title>
            <Panel.Body>
              {apiVariables &&
                query &&
                modelVariable &&
                methods &&
                methods.algorithms
                  .map(algorithm => {
                    let isEnabled = false;
                    const disabled = { ...algorithm, enabled: false };
                    const enabled = { ...algorithm, enabled: true };

                    const apiVariable = apiVariables.find(
                      (v: any) => v.code === modelVariable
                    );
                    const algoConstraints: any = algorithm.constraints;
                    const algoConstraintVariable = algoConstraints.variable;
                    const apiVariableType = apiVariable && apiVariable.type;

                    if (apiVariableType) {
                      if (algoConstraintVariable[apiVariableType]) {
                        isEnabled = true;
                      }
                    }

                    const algoConstraintCovariable =
                      algoConstraints.covariables;
                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.min_count
                    ) {
                      isEnabled = false;
                    }

                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.max_count
                    ) {
                      isEnabled = false;
                    }

                    const algoConstraintGrouping = algoConstraints.groupings;
                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.min_count
                    ) {
                      isEnabled = false;
                    }

                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.max_count
                    ) {
                      isEnabled = false;
                    }

                    const mixed = algoConstraints.mixed;
                    if (
                      modelGroupings.length > 0 &&
                      modelCovariables.length > 0 &&
                      !mixed
                    ) {
                      isEnabled = false;
                    }

                    return isEnabled ? enabled : disabled;
                  })
                  .map((a: any) => (
                    <div className="method" key={a.code}>
                      <a
                        title={a.description}
                        // tslint:disable-next-line jsx-no-lambda
                        onClick={event => this.handleSelectMethod(event, a)}
                        style={
                          a.enabled ? { color: "green" } : { color: "gray" }
                        }
                      >
                        {a.label}
                      </a>
                    </div>
                  ))}
            </Panel.Body>
          </Panel>
        </div>
        <div className="content">
          <Panel>
            <Panel.Title>
              <div className="flexbox">
                <h3 className="item">Your Experiment</h3>
              </div>
            </Panel.Title>
            <Panel.Body>
              <Alert show={this.state.showAlert} message={this.state.alertMessage}/>
              <Tabs
                defaultActiveKey={1}
                id="uncontrolled-create-experiment-tab"
              >
                <Tab eventKey={1} title="Method">
                  {selectedMethod && (
                    <div>
                      <h4>
                        <strong>{selectedMethod.label}</strong>
                      </h4>
                      <p>{selectedMethod.description}</p>
                    </div>
                  )}
                  {!selectedMethod && (
                    <div>
                      <h4>
                        <strong>Your method</strong>
                      </h4>
                      <p>Please, select a method on the right pane</p>
                    </div>
                  )}
                  {selectedMethod && (
                    <fieldset>
                      <h5>
                        {isPredictiveMethod && (
                          <strong>Training & kfold</strong>
                        )}
                        {!isPredictiveMethod && <strong>Datasets</strong>}
                      </h5>
                      <FormGroup>
                        {datasets &&
                          datasets.map((dataset: any) => {
                            return (
                              <Checkbox
                                key={dataset.code}
                                inline={true}
                                // tslint:disable-next-line jsx-no-lambda
                                onChange={event =>
                                  this.handleChangeDataset(
                                    query && query.trainingDatasets,
                                    dataset.code,
                                    DatasetType.Training
                                  )
                                }
                                checked={this.getDatasetCheckedState(
                                  query && query.trainingDatasets,
                                  dataset.code
                                )}
                              >
                                {dataset.label}
                              </Checkbox>
                            );
                          })}
                      </FormGroup>
                      {isPredictiveMethod && (
                        <div>
                          <h5>
                            <strong>Remote-validation</strong>
                          </h5>
                          <FormGroup>
                            {datasets &&
                              datasets.map((dataset: any) => {
                                return (
                                  <Checkbox
                                    key={dataset.code}
                                    inline={true}
                                    // tslint:disable-next-line jsx-no-lambda
                                    onChange={event =>
                                      this.handleChangeDataset(
                                        query && query.validationDatasets,
                                        dataset.code,
                                        DatasetType.Validation
                                      )
                                    }
                                    checked={this.getDatasetCheckedState(
                                      query && query.validationDatasets,
                                      dataset.code
                                    )}
                                  >
                                    {dataset.label}
                                  </Checkbox>
                                );
                              })}
                          </FormGroup>
                        </div>
                      )}
                    </fieldset>
                  )}
                  {parameters && parameters.length > 0 && <h4>Parameters</h4>}
                  <Form horizontal={true}>
                    {parameters &&
                      parameters.map((parameter: any) => {
                        const numberTypes = [
                          "int",
                          "real",
                          "number",
                          "numeric"
                        ];
                        const type =
                          numberTypes.indexOf(parameter.type) >= -1
                            ? "number"
                            : "text";
                        const { constraints } = parameter;

                        return (
                          <FormGroup
                            validationState={this.getValidationState(parameter)}
                            key={parameter.code}
                          >
                            <Col sm={2}>{parameter.label}</Col>
                            <Col sm={4}>
                              {parameter.type !== "enumeration" && (
                                <FormControl
                                  type={type}
                                  defaultValue={parameter.default_value}
                                  // tslint:disable-next-line jsx-no-lambda
                                  onChange={event =>
                                    this.handleChangeParameter(
                                      event,
                                      parameter.code
                                    )
                                  }
                                />
                              )}
                              {parameter.type === "enumeration" && (
                                <FormControl
                                  componentClass="select"
                                  placeholder="select"
                                  defaultValue={parameter.default_value}
                                  // tslint:disable-next-line jsx-no-lambda
                                  onChange={event =>
                                    this.handleChangeParameter(
                                      event,
                                      parameter.code
                                    )
                                  }
                                >
                                  {parameter.values.map((v: any) => (
                                    <option key={v} value={v}>
                                      {v}
                                    </option>
                                  ))}
                                </FormControl>
                              )}
                              <FormControl.Feedback />
                              <HelpBlock>
                                {constraints &&
                                  constraints.min >= 0 &&
                                  "min: " + constraints.min}
                                {constraints &&
                                  constraints.min >= 0 &&
                                  constraints.max >= 0 &&
                                  ", "}
                                {constraints &&
                                  constraints.max >= 0 &&
                                  "max: " + constraints.max}
                              </HelpBlock>
                            </Col>
                            <Col sm={6}>{parameter.description}</Col>
                          </FormGroup>
                        );
                      })}
                  </Form>
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
      </div>
    );
  }

  private getValidationState = (params: any) => {
    const { constraints, code } = params;
    if (constraints) {
      const { parameters } = this.state;
      const { min, max } = constraints;
      if (parameters[code] < min || parameters[code] > max) {
        return "error";
      }
    }

    return "success";
  };

  private handleSelectMethod = (event: any, selectedMethod: any) => {
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

  private handleChangeParameter = (event: any, code: string) => {
    event.preventDefault();
    this.setState({
      parameters: {
        ...this.state.parameters,
        [code]: event.target.value
      }
    });
  };

  private handleChangeDataset = (
    datasets: any,
    code: any,
    type: DatasetType
  ) => {
    const { model } = this.state;
    if (model) {
      const { query } = model;
      if (type === 0) {
        query.trainingDatasets = this.toggleDataset(datasets, code);

        if (
          this.getDatasetCheckedState(query.trainingDatasets, code) &&
          this.getDatasetCheckedState(query.validationDatasets, code)
        ) {
          query.validationDatasets = this.toggleDataset(
            query.validationDatasets,
            code
          );
        }
      } else if (type === 1) {
        query.validationDatasets = this.toggleDataset(datasets, code);

        if (
          this.getDatasetCheckedState(query.trainingDatasets, code) &&
          this.getDatasetCheckedState(query.validationDatasets, code)
        ) {
          query.trainingDatasets = this.toggleDataset(
            query.trainingDatasets,
            code
          );
        }
      }

      model.query = query;
      this.setState({ model });
    }
  };

  private handleChangeExperimentName = (event: any) => {
    this.setState({
      experimentName: event.target.value
    });
  };

  private getDatasetCheckedState = (selectedDatasets: any = [], code: any) => {
    if (selectedDatasets.map((d: any) => d.code).indexOf(code) === -1) {
      return false;
    }

    return true;
  };

  private toggleDataset = (datasets: any, code: any): any => {
    let newDataset = [];
    if (datasets) {
      if (datasets.map((d: any) => d.code).indexOf(code) > -1) {
        newDataset = [...datasets.filter((d: any) => d.code !== code)];
      } else {
        newDataset = [...datasets, { code }];
      }
    } else {
      newDataset = [{ code }];
    }

    return newDataset;
  };

  private handleSaveModelAndRunExperiment = async (e: any) => {
    if (this.state.experimentName.length <= 0) {
      return this.setState({ showAlert: true, alertMessage: 'Please enter a name for your experiment' });
    }

    this.setState({ showAlert: false });
    const { experimentContainer, modelContainer } = this.props;
    const { model, selectedMethod, parameters } = this.state;

    await modelContainer.update(model);
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
      model: model!.slug,
      name: this.state.experimentName,
      validations: []
    };

    let uuid;
    await experimentContainer.create(exp);
    const { experiment, error } = experimentContainer.state;

    if (error) {
      this.setState({
        alertMessage: `${error}`,
        showAlert: true
      })

      return
    }

    uuid = experiment && experiment.uuid;

    const { history } = this.props;
    history.push(`/v3/experiment/${model && model.slug}/${uuid}`);
  };
}

export default withRouter(Experiment);
