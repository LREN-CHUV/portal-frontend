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
  parameters: any[];
  model: IModelResult | undefined;
  showPopover: boolean;
}

class Experiment extends React.Component<IProps, IState> {
  public state: IState = {
    experimentName: "",
    model: undefined,
    parameters: [],
    selectedMethod: undefined,
    showPopover: false
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

    const rawVariables = exploreContainer.state.variables;
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

    return (
      <div className="Experiment RunExperiment">
        <div className="header">
          <Header
            handleSaveAndRunExperiment={this.saveModelAndRunExperiment}
            handleChangeExperimentName={this.handleChangeExperimentName}
            selectedMethod={selectedMethod}
            experimentName={this.state.experimentName}
            showPopover={this.state.showPopover}
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
              {rawVariables &&
                query &&
                modelVariable &&
                methods &&
                methods.algorithms
                  .map(algorithm => {
                    const rawVariable = rawVariables.find(
                      (v: any) => v.code === modelVariable
                    );
                    const algoConstraints: any = algorithm.constraints;

                    const disabled = { ...algorithm, enabled: false };

                    const algoConstraintVariable = algoConstraints.variable;
                    const type = rawVariable && rawVariable.type;
                    if (type) {
                      if (
                        algoConstraintVariable.binominal &&
                        type === "binominal"
                      ) {
                        return disabled;
                      }
                      if (
                        algoConstraintVariable.integer &&
                        type === "integer"
                      ) {
                        return disabled;
                      }
                      if (
                        algoConstraintVariable.polynominal &&
                        type === "polynominal"
                      ) {
                        return disabled;
                      }
                      if (algoConstraintVariable.real && type === "real") {
                        return disabled;
                      }
                    }

                    const algoConstraintCovariable =
                      algoConstraints.covariables;
                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.min_count
                    ) {
                      return disabled;
                    }

                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.max_count
                    ) {
                      return disabled;
                    }

                    const algoConstraintGrouping = algoConstraints.groupings;
                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.min_count
                    ) {
                      return disabled;
                    }

                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.max_count
                    ) {
                      return disabled;
                    }

                    const mixed = algoConstraints.mixed;
                    if (
                      modelGroupings.length > 0 &&
                      modelCovariables.length > 0 &&
                      !mixed
                    ) {
                      return disabled;
                    }

                    return { ...algorithm, enabled: true };
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
              <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
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
                <Tab eventKey={2} title="Training and validation">
                  <h5>
                    <strong>Training</strong>
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
                  <h5>
                    <strong>Validation</strong>
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
                </Tab>
              </Tabs>
              ;
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Title>
              <h3>About running experiments</h3>
            </Panel.Title>
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

  private handleSelectMethod = (event: any, method: any) => {
    event.preventDefault();
    const parameters = (method && method.parameters) || undefined;

    let newParams = [];
    if (parameters) {
      newParams = parameters.map((p: any) => ({
        code: p.code,
        value: p.default_value
      }));
    }
    this.setState({
      parameters: newParams,
      selectedMethod: method
    });
  };

  private handleChangeParameter = (event: any, code: string) => {
    event.preventDefault();
    // this.setState({
    //   parameters: {
    //     ...this.state.parameters,
    //     [code]: event.target.value
    //   }
    // });
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

  private saveModelAndRunExperiment = async (e: any) => {
    if (this.state.experimentName.length <= 0) {
      return this.setState({ showPopover: true });
    }

    this.setState({ showPopover: false });
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
          parameters,
          validation
        }
      ],
      model: model!.slug,
      name: this.state.experimentName,
      validations: []
    };

    const { history } = this.props;

    let uuid;
    try {
      await experimentContainer.create(exp);
      const experiment = experimentContainer.state.experiment;
      uuid = experiment && experiment.uuid;
    } catch (error) {
      console.log(error);
    }

    history.push(`/v3/experiment/${model && model.slug}/${uuid}`);
    // return <Redirect to={`/v3/experiment/${model && model.slug}/${uuid}`} />;
  };
}

export default withRouter(Experiment);
