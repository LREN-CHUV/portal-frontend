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

const Validation = ({
  isPredictiveMethod,
  datasets,
  query,
  handleUpdateQuery,
  kfold,
  handleChangeKFold,
  isLocal = true
}: {
  isPredictiveMethod: boolean;
  datasets: any;
  query: any;
  handleUpdateQuery: any;
  kfold?: number;
  handleChangeKFold?: (kfold: number) => void;
  isLocal?: boolean
}) => (
  <div>
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
                handleChangeDataset(
                  query,
                  query && query.trainingDatasets,
                  dataset.code,
                  DatasetType.Training,
                  handleUpdateQuery
                )
              }
              checked={getDatasetCheckedState(
                query && query.trainingDatasets,
                dataset.code
              )}
            >
              {dataset.label}
            </Checkbox>
          );
        })}
    </FormGroup>

    {isPredictiveMethod && handleChangeKFold && (
      <Form horizontal={true}>
        <FormGroup key={"kfold"}>
          <Col sm={2}>K-Fold:</Col>
          <Col sm={4}>
            <FormControl
              type="number"
              value={kfold}
              // tslint:disable-next-line jsx-no-lambda
              onChange={(event: any) => {
                if (event.target) {
                  event.preventDefault();
                  handleChangeKFold(event.target.value);
                }
              }}
            />
            <HelpBlock>min: 2, max 20</HelpBlock>
            <FormControl.Feedback />
          </Col>
          <Col sm={6}>
            Defines the number of folds used in the cross-validation. Typical
            numbers are 5 or 10. More information:{" "}
            <a
              target="_blank"
              href="https://en.wikipedia.org/wiki/Cross-validation_(statistics)"
            >
              https://en.wikipedia.org/wiki/Cross-validation_(statistics)
            </a>
          </Col>
        </FormGroup>
      </Form>
    )}
    {isPredictiveMethod && !isLocal && (
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
                    handleChangeDataset(
                      query,
                      query && query.validationDatasets,
                      dataset.code,
                      DatasetType.Validation,
                      handleUpdateQuery
                    )
                  }
                  checked={getDatasetCheckedState(
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
  </div>
);

const handleChangeDataset = (
  query: any,
  datasets: any,
  code: string,
  type: DatasetType,
  handleUpdateQuery: any
) => {
  if (query) {
    if (type === DatasetType.Training) {
      query.trainingDatasets = toggleDataset(datasets, code);

      if (
        getDatasetCheckedState(query.trainingDatasets, code) &&
        getDatasetCheckedState(query.validationDatasets, code)
      ) {
        query.validationDatasets = toggleDataset(
          query.validationDatasets,
          code
        );
      }
    } else if (type === DatasetType.Validation) {
      query.validationDatasets = toggleDataset(datasets, code);

      if (
        getDatasetCheckedState(query.trainingDatasets, code) &&
        getDatasetCheckedState(query.validationDatasets, code)
      ) {
        query.trainingDatasets = toggleDataset(query.trainingDatasets, code);
      }
    }
    handleUpdateQuery(query);
  }
};

const getDatasetCheckedState = (selectedDatasets: any = [], code: any) => {
  if (
    selectedDatasets &&
    selectedDatasets.map((d: any) => d.code).indexOf(code) === -1
  ) {
    return false;
  }

  return true;
};

const toggleDataset = (datasets: any, code: any): any => {
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

export default Validation;
