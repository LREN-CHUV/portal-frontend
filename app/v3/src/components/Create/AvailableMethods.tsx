import * as React from 'react';
import { Button } from 'react-bootstrap';

import { Algorithm, VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';

const excludedLocalAlgorithms: string[] = [
  // 'K_MEANS',
  // 'WP_LINEAR_REGRESSION',
  // 'PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER',
  // 'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER'
];

const AvailableMethods = ({
  isLocal,
  algorithms,
  variables,
  handleSelectMethod,
  model
}: {
  isLocal: boolean;
  algorithms: Algorithm[] | undefined;
  variables: VariableEntity[] | undefined;
  handleSelectMethod: (method: Algorithm) => void;
  model: ModelResponse | undefined;
}) => {
  const query = model && model.query;
  const modelVariable =
    (query && query.variables && query.variables.map(v => v.code)[0]) || '';
  const modelCovariables =
    (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
  const modelGroupings =
    (query && query.groupings && query.groupings.map(v => v.code)) || [];

  const availableAlgorithms =
    (algorithms &&
      algorithms
        // .filter(a => a.code === 'LOGISTIC_REGRESSION')
        .map((algorithm: any) => {
          let isEnabled = false;

          const apiVariable =
            variables && variables.find((v: any) => v.code === modelVariable);
          const apiCovariables: VariableEntity[] | undefined =
            variables &&
            variables.filter((v: any) => modelCovariables.includes(v.code));
          const apiGroupings: VariableEntity[] | undefined =
            variables &&
            variables.filter((v: any) => modelGroupings.includes(v.code));
          const algoConstraints: any = algorithm.constraints;
          const algoConstraintVariable = algoConstraints.variable;
          const apiVariableType = apiVariable && apiVariable.type;

          // Check variables type vs algorithm input types
          if (apiVariableType) {
            if (algoConstraintVariable[apiVariableType]) {
              isEnabled = true;
            }
          }

          if (apiCovariables) {
            const covartypes: string[] = Array.from(
              new Set([...apiCovariables.map(v => v.type || '')])
            );
            isEnabled =
              isEnabled &&
              covartypes.every(
                t =>
                  algoConstraints.covariables &&
                  // either there is no constraint, or the constraint has to be from the specified type
                  (algoConstraints.covariables[t] === undefined ||
                    algoConstraints.covariables[t])
              );
          }

          if (apiGroupings) {
            const covartypes: string[] = Array.from(
              new Set([...apiGroupings.map(v => v.type || '')])
            );
            isEnabled =
              isEnabled &&
              covartypes.every(
                t =>
                  algoConstraints.groupings &&
                  // either there is no constraint, or the constraint has to be from the specified type
                  (algoConstraints.groupings[t] === undefined ||
                    algoConstraints.groupings[t])
              );
          }

          const algoConstraintCovariable = algoConstraints.covariables;
          if (algoConstraintCovariable) {
            if (
              algoConstraintCovariable.min_count &&
              modelCovariables.length < algoConstraintCovariable.min_count
            ) {
              isEnabled = false;
            }
            if (
              algoConstraintCovariable.max_count &&
              modelCovariables.length > algoConstraintCovariable.max_count
            ) {
              isEnabled = false;
            }
          }

          const algoConstraintGrouping = algoConstraints.groupings;
          if (algoConstraintGrouping) {
            if (
              algoConstraintGrouping.min_count &&
              modelGroupings.length < algoConstraintGrouping.min_count
            ) {
              isEnabled = false;
            }
            if (
              algoConstraintGrouping.max_count &&
              modelGroupings.length > algoConstraintGrouping.max_count
            ) {
              isEnabled = false;
            }
          }

          const mixed = algoConstraints.mixed;
          if (
            modelGroupings.length > 0 &&
            modelCovariables.length > 0 &&
            !mixed
          ) {
            isEnabled = false;
          }

          if (isLocal && excludedLocalAlgorithms.includes(algorithm.code)) {
            isEnabled = false;
          }

          return isEnabled
            ? { ...algorithm, enabled: true }
            : { ...algorithm, enabled: false };
        })) ||
    [];

  const dontFakeMethodName = availableAlgorithms.map((f: any) =>
    f.label === 'Bayesian Linear Regression'
      ? {
          ...f,
          label: 'Standard Linear Regression'
        }
      : f
  );

  const sortedAlgorithms =
    dontFakeMethodName &&
    dontFakeMethodName.sort((a: Algorithm, b: Algorithm) => {
      try {
        const typea = (a && a.type && a.type.length > 0 && a.type[0]) || '';
        const typeb = (b && b.type && b.type.length > 0 && b.type[0]) || '';

        return typea < typeb ? 1 : typea > typeb ? -1 : 0;
      } catch (e) {
        return 0;
      }
    });

  const types = Array.from(new Set(sortedAlgorithms.map(f => f.type).flat(1)));

  return (
    <React.Fragment>
      {types.map(type => (
        <div className='method' key={type}>
          <h4>{type}</h4>
          {sortedAlgorithms
            .filter(a => a.type && a.type.includes(type))
            .map((algorithm: any) => (
              <div className='method' key={algorithm.code}>
                <Button
                  key={algorithm.code}
                  bsStyle='link'
                  title={`${algorithm.type} - ${algorithm.description}`}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => handleSelectMethod(algorithm)}
                  style={{
                    color: algorithm.enabled ? '#03a9f4' : 'gray',
                    padding: 0,
                    textTransform: 'none'
                  }}
                  disabled={!algorithm.enabled}>
                  {algorithm.label}
                </Button>
              </div>
            ))}
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableMethods;
