import { MIP } from "../../types";
import * as React from "react";
import { Button } from "react-bootstrap";

const AvailableMethods = ({
  methods,
  variables,
  handleSelectMethod,
  model
}: {
  methods: MIP.API.IMethods | undefined;
  variables: MIP.API.IVariableEntity[] | undefined;
  handleSelectMethod: (method: MIP.API.IMethod) => void;
  model: MIP.API.IModelResponse | undefined;
}) => {
  const query = model && model.query;
  const modelVariable =
    query && query.variables && query.variables.map(v => v.code)[0];
  const modelCovariables =
    (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
  const modelGroupings =
    (query && query.groupings && query.groupings.map(v => v.code)) || [];

  const availableAlgorithms =
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

  const sortedAlgorithms =
    availableAlgorithms &&
    availableAlgorithms.sort((a: MIP.API.IMethod, b: MIP.API.IMethod) => {
      try {
        const typea = (a && a.type && a.type.length > 0 && a.type[0]) || "";
        const typeb = (b && b.type && b.type.length > 0 && b.type[0]) || "";

        return typea < typeb ? 1 : typea > typeb ? -1 : 0;
      } catch (e) {
        return 0;
      }
    });

  return (
    <React.Fragment>
      {sortedAlgorithms.map((algorithm: any) => (
        <div className="method" key={algorithm.code}>
          <Button
            key={algorithm.code}
            bsStyle="link"
            title={`${algorithm.type} - ${algorithm.description}`}
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => handleSelectMethod(algorithm)}
            style={{
              color: algorithm.enabled ? "#03a9f4" : "gray",
              padding: 0,
              textTransform: "none"
            }}
            disabled={!algorithm.enabled}
          >
            {algorithm.label}
          </Button>
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableMethods;
