import { IQuery } from "@app/types";
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
  datasets: any | undefined;
  query: IQuery | undefined;
  method: any | undefined;
  parameters: any | undefined;
  kfold: number | undefined;
  handleUpdateQuery: (query: IQuery) => void;
  handleChangeParameters: (parameters: any) => void;
  handleChangeKFold: (kfold: number) => void;

}

class FForm extends React.Component<IProps> {

  public render() {
    const { datasets, query, method, parameters } = this.props;
    const isPredictiveMethod =
      (method && method.type[0] === "predictive_model") || false;

    return (
      <div>
        {method && (
          <div>
            <h4>
              <strong>{method.label}</strong>
            </h4>
            <p>{method.description}</p>
          </div>
        )}
        {!method && (
          <div>
            <h4>
              <strong>Your method</strong>
            </h4>
            <p>Please, select a method on the right pane</p>
          </div>
        )}

        {isPredictiveMethod && 
        <Form horizontal={true}>
                <FormGroup validationState={this.getKFoldValidationState()}
                  key={'kfold'}>
                  <Col sm={2}>K-Fold:</Col>
                  <Col sm={4}>
                    <FormControl
                      defaultValue={"0"}
                      type="number"
                      onChange={this.handleChangeKFold}
                    />
<HelpBlock>
                      min: 0, max 20
                    </HelpBlock>
                    <FormControl.Feedback />
                  </Col>
                  <Col sm={6}>Defines the number of folds used in the cross-validation. Typical numbers are 2 or 10. More information: https://en.wikipedia.org/wiki/Cross-validation_(statistics)</Col>
                </FormGroup>
                </Form>
              }
              
              {method && (
          <fieldset style={{ padding: "8px" }}>
            <h5>
              {isPredictiveMethod && <strong>Training and kfold</strong>}
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
      const { parameters } = this.props;
      const { min, max } = constraints;
      if (parameters[code] < min || parameters[code] > max) {
        return "error";
      }
    }

    return "success";
  };

  private getKFoldValidationState = () => {
    const { kfold } = this.props;
    if (!kfold) {
      return 'success'
    }
    return kfold && kfold > -1 ? 'success' : 'error' 
  }

  private handleChangeKFold = (event: any) => {
    event.preventDefault();
    const kfold = event.target.value
    this.props.handleChangeKFold(kfold)
  }

  private handleChangeParameter = (event: any, code: string) => {
    event.preventDefault();
    const parameters = {
      ...this.props.parameters,
      [code]: event.target.value
    }

    this.props.handleChangeParameters(parameters)
    
  };

  private handleChangeDataset = (
    datasets: any,
    code: string,
    type: DatasetType
  ) => {
    const { query } = this.props;
    if (query) {
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

      this.props.handleUpdateQuery(query);
    }
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

export default FForm;
