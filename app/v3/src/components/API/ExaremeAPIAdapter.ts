const buildConstraints = (algo: any, params: string[]) => {
  const variable = algo.parameters.find((p: any) => params.includes(p.name));
  const variableTypes =
    variable &&
    variable.columnValuesSQLType.split(',').map((c: any) => c.trim());
  const variableColumnValuesIsCategorical =
    (variable && variable.columnValuesIsCategorical === 'true') || false;
  const variableConstraint = {
    binominal: variableColumnValuesIsCategorical,
    integer: variableTypes && variableTypes.includes('integer') ? true : false,
    polynominal: variableColumnValuesIsCategorical,
    real: variableTypes && variableTypes.includes('real') ? true : false
  };

  return variableConstraint;
};

const dependents = ['Y', 'column2', 'y', 'target_attributes'];
const independents = ['X', 'column1', 'x', 'descriptive_attributes'];

const buildParameters = (algo: any) => {
  const parameters = algo.parameters.filter(
    (p: any) =>
      ![
        ...dependents,
        ...independents,
        'dataset',
        'filter',
        'outputformat',
        'type'
      ].includes(p.name)
  );

  const params =
    (parameters &&
      parameters.map((parameter: any) => ({
        code: parameter.name,
        constraints: {
          min: parameter.valueNotBlank ? 1 : 0
        },
        default_value: parameter.value,
        description: parameter.desc,
        label: parameter.name,
        type: parameter.valueType
      }))) ||
    [];

  return params;
};

const exaremeAlgorithms = (json: any) =>
  json.map((algorithm: any) => {
    return {
      code: algorithm.name,
      constraints: {
        covariables: buildConstraints(algorithm, independents),
        variable: buildConstraints(algorithm, dependents)
      },
      description: algorithm.desc,
      enabled: true,
      label: algorithm.name,
      parameters: buildParameters(algorithm),
      source: 'exareme',
      type: ['exareme'],
      validation: true
    };
  });

export const parse = (json: any) => exaremeAlgorithms(json);
