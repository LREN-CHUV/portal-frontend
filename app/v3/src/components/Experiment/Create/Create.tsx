// tslint:disable:no-console
import { APICore, APIExperiment, APIModel } from "@app/components/API";

import { IModelResult } from "@app/types";
import * as React from "react";
import {
  Checkbox,
  Col,
  Form,
  FormControl,
  FormGroup,
  HelpBlock
} from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";

enum DatasetType {
  Training,
  Validation,
  Test
}

interface IProps extends RouteComponentProps<any> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

interface IState {
  experimentName: string;
  selectedMethod: any | undefined;
  parameters: object;
  model: IModelResult | undefined;
}

class Create extends React.Component<IProps, IState> {
  public state: IState = {
    experimentName: "",
    model: undefined,
    parameters: {},
    selectedMethod: undefined
  };

  constructor(props: IProps) {
    super(props);
    this.handleChangeExperimentName = this.handleChangeExperimentName.bind(
      this
    );
  }

  public async componentDidMount() {
    const { match } = this.props;
    if (!match) {
      return;
    }
    const { slug } = match.params;
    const { apiModel } = this.props;
    await apiModel.one(slug);

    return this.setState({
      model: apiModel.state.model
    });
  }

  public componentWillReceiveProps = (props: any) => {
    const { apiModel } = props;
    return this.setState({
      model: apiModel.state.model
    });
  };

  public render() {
    const { model } = this.state;
    const { apiCore } = this.props;
    const datasets = apiCore.state.datasets;
    const query = model && model.query;
 const { selectedMethod } = this.state;
    const parameters =
      (selectedMethod && selectedMethod.parameters) || undefined;
    const isPredictiveMethod =
      (selectedMethod && selectedMethod.type[0] === "predictive_model") ||
      false;

    // const state = apiModel.state;
    // const title = (state && state.model && state.model.title) || "";

    return (
      <div>
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
                {isPredictiveMethod && <strong>Training & kfold</strong>}
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
                const numberTypes = ["int", "real", "number", "numeric"];
                const type =
                  numberTypes.indexOf(parameter.type) >= -1 ? "number" : "text";
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
                            this.handleChangeParameter(event, parameter.code)
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
                            this.handleChangeParameter(event, parameter.code)
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
      </div>
    );
  }

  // private handleSelectExperiment = async (
  //   selectedExperiment: IExperimentResult
  // ) => {
  //   const { modelDefinitionId, uuid } = selectedExperiment;
  //   const { apiExperiment, history } = this.props;
  //   history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);

  //   return await apiExperiment.one(uuid);
  // };

  // private handleSelectModel = async (selectedModel: IModelResult) => {
  //   console.log(selectedModel);
  //   const { slug } = selectedModel;
  //   const { apiModel, history } = this.props;
  //   history.push(`/v3/experiment/${slug}`);

  //   return await apiModel.one(slug);
  // };

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

  // private handleSelectMethod = (event: any, selectedMethod: any) => {
  //   event.preventDefault();
  //   const methodParameters =
  //     (selectedMethod && selectedMethod.parameters) || undefined;

  //   const parameters = {};
  //   if (methodParameters) {
  //     methodParameters.forEach((p: any) => {
  //       parameters[p.code] = p.default_value;
  //     });
  //   }
  //   this.setState({
  //     parameters,
  //     selectedMethod
  //   });
  // };

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

}

export default withRouter(Create);
