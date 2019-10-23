import { AlgorithmConstraintParameter, AlgorithmParameter } from './Core';
import { ExperimentResponse } from './Experiment';
const independents = ['X', 'column1', 'x', 'descriptive_attributes'];
const dependents = ['Y', 'column2', 'y', 'target_attributes'];
const HIDDEN_PARAMETERS = [
  ...dependents,
  ...independents,
  'dataset',
  'filter',
  'pathology'
];

const buildConstraints = (algo: any) => {
  const variable = algo.parameters.find((p: any) =>
    dependents.includes(p.name)
  );

  let mixed = true;

  const variableTypes =
    variable &&
    variable.columnValuesSQLType.split(',').map((c: any) => c.trim());
  const variableColumnValuesIsCategorical =
    variable &&
    (variable.columnValuesIsCategorical === 'true'
      ? true
      : variable.columnValuesIsCategorical === 'false'
      ? false
      : undefined);
  const variableColumnValuesIsBinominal =
    (variable && variable.columnValuesNumOfEnumerations === '2') || false;

  const variableConstraint: AlgorithmConstraintParameter =
    variableColumnValuesIsCategorical === undefined
      ? {
          binominal: variableColumnValuesIsBinominal || true,
          polynominal: !variableColumnValuesIsBinominal ? true : false,
          real: variableTypes && variableTypes.includes('real') ? true : false,
          integer:
            variableTypes && variableTypes.includes('integer') ? true : false
        }
      : variableColumnValuesIsCategorical
      ? {
          binominal:
            variableColumnValuesIsBinominal ||
            variableColumnValuesIsCategorical,
          polynominal: !variableColumnValuesIsBinominal ? true : false
        }
      : {
          real: variableTypes && variableTypes.includes('real') ? true : false,
          integer:
            variableTypes && variableTypes.includes('integer') ? true : false
        };

  const covariables = algo.parameters.find((p: any) =>
    independents.includes(p.name)
  );
  const covariableTypes =
    covariables &&
    covariables.columnValuesSQLType.split(',').map((c: any) => c.trim());
  const covariableColumnValuesIsCategorical =
    covariables &&
    (covariables.columnValuesIsCategorical === 'true'
      ? true
      : covariables.columnValuesIsCategorical === 'false'
      ? false
      : undefined);

  // both false and undefined
  const covariableConstraint: AlgorithmConstraintParameter = {};

  /* eslint-disable */
  if (!covariableColumnValuesIsCategorical) {
    if (covariableTypes && covariableTypes.includes('integer')) {
      covariableConstraint.integer = true;
    }

    if (covariableTypes && covariableTypes.includes('real')) {
      covariableConstraint.real = true;
    }
  } else {
    mixed = false;
    covariableConstraint.max_count = 0;
  }

  const covariableColumnValuesIsBinominal =
    (covariables && covariables.columnValuesNumOfEnumerations === '2') || false;

  const groupingsConstraint: AlgorithmConstraintParameter =
    covariableColumnValuesIsCategorical ||
    covariableColumnValuesIsCategorical === undefined
      ? {
          binominal: covariableColumnValuesIsBinominal || true,
          polynominal: !covariableColumnValuesIsBinominal ? true : false
        }
      : { max_count: 0 };

  if (variable && variable.valueNotBlank) {
    variableConstraint.min_count = 1;
  }

  if (variable && !variable.valueMultiple) {
    variableConstraint.max_count = 1;
  }

  if (covariables && covariables.valueNotBlank) {
    if (covariableColumnValuesIsCategorical !== false) {
      groupingsConstraint.min_count = 1;
    } else {
      covariableConstraint.min_count = 1;
    }
  }

  if (covariables && !covariables.valueMultiple) {
    if (covariableColumnValuesIsCategorical) {
      groupingsConstraint.max_count = 1;
    } else {
      covariableConstraint.max_count = 1;
    }
  }

  return {
    covariables: covariableConstraint,
    variable: variableConstraint,
    groupings: groupingsConstraint,
    mixed
  };
};


const stripModelParameters = (
  experimentResponse: ExperimentResponse
): ExperimentResponse => {
  experimentResponse.algorithms = experimentResponse.algorithms.map(a => {
    const parameters: AlgorithmParameter[] = a.parameters || [];

    return {
      ...a,
      parameters: parameters.filter(p => !HIDDEN_PARAMETERS.includes(p.name))
    };
  });

  return experimentResponse;
};

export {
  stripModelParameters,
  HIDDEN_PARAMETERS as hiddenParameters
};
