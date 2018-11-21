import { APICore } from "@app/components/API";
import { IModelResult } from "@app/types";
import * as React from "react";
import { Button } from "react-bootstrap";

const AvailableMethods = ({
  apiCore,
  handleSelectMethod,
  model
}: {
  apiCore: APICore;
  handleSelectMethod: any;
  model: IModelResult | undefined;
}) => {
  const methods = apiCore && apiCore.state && apiCore.state.methods;
  const apiVariables = apiCore.state.variables;
  const query = model && model.query;
  const modelVariable =
    query && query.variables && query.variables.map(v => v.code)[0];
  const modelCovariables =
    (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
  const modelGroupings =
    (query && query.groupings && query.groupings.map(v => v.code)) || [];

  const availableMethods =
    (apiVariables &&
      query &&
      modelVariable &&
      methods &&
      methods.algorithms.map(algorithm => {
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
      {availableMethods.map((a: any) => (
        <div className="method" key={a.code}>
          <Button
            key={a.code}
            bsStyle="link"
            title={a.description}
            // tslint:disable-next-line jsx-no-lambda
            onClick={event => handleSelectMethod(event, a)}
            style={{ "textTransform": "none", "padding": 0, color: a.enabled ? "#337ab7" : "gray"}}
            disabled={!a.enabled}
          >
            {a.label}
          </Button>
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableMethods;
