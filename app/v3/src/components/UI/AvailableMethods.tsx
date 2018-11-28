import {
  IAlgorithm,
  IMethods,
  IModelResult,
  IVariableEntity
} from "@app/types";
import * as React from "react";
import { Button } from "react-bootstrap";

const AvailableMethods = ({
  methods,
  variables,
  handleSelectMethod,
  model
}: {
  methods: IMethods | undefined;
  variables: IVariableEntity[] | undefined;
  handleSelectMethod: (method: IAlgorithm) => void;
  model: IModelResult | undefined;
}) => {
  const query = model && model.query;
  const modelVariable =
    query && query.variables && query.variables.map(v => v.code)[0];
  const modelCovariables =
    (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
  const modelGroupings =
    (query && query.groupings && query.groupings.map(v => v.code)) || [];

  const availableMethods =
    (variables &&
      query &&
      modelVariable &&
      methods &&
      methods.algorithms.map(algorithm => {
        let isEnabled = false;
        const disabled = { ...algorithm, enabled: false };
        const enabled = { ...algorithm, enabled: true };

        const apiVariable = variables.find(
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

        const algoConstraintCovariable = algoConstraints.covariables;
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
      })) ||
    [];

  return (
    <React.Fragment>
      {availableMethods.map((method: any) => (
        <div className="method" key={method.code}>
          <Button
            key={method.code}
            bsStyle="link"
            title={method.description}
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => handleSelectMethod(method)}
            style={{
              color: method.enabled ? "#03a9f4" : "gray",
              padding: 0,
              textTransform: "none"
            }}
            disabled={!method.enabled}
          >
            {method.label}
          </Button>
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableMethods;
