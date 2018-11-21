import { APICore, APIExperiment } from "@app/components/API";

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

enum DatasetType {
  Training,
  Validation,
  Test
}

interface IProps {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  model: IModelResult | undefined;
  handleUpdateModel: any;
  selectedMethod: any | undefined;
}

interface IState {
  experimentName: string;
  parameters: object;
}

class Create extends React.Component<IProps, IState> {
  public state: IState = {
    experimentName: "",
    parameters: {}
  };

  constructor(props: IProps) {
    super(props);
    this.handleChangeExperimentName = this.handleChangeExperimentName.bind(
      this
    );
  }

  public render() {
    const { apiCore, model, selectedMethod } = this.props;
    const datasets = apiCore.state.datasets;
    const query = model && model.query;
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
          <fieldset style={{ padding: "8px" }}>
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
    code: string,
    type: DatasetType
  ) => {
    const { model } = this.props;
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

      const { handleUpdateModel } = this.props;
      handleUpdateModel(model);
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

export default Create;
