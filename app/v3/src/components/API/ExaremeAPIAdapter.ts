import {
  Algorithm,
  AlgorithmConstraint,
  AlgorithmConstraintDetail,
  AlgorithmParameter
} from './Core';
import { ModelResponse } from './Model';
import { ExperimentResponse } from './Experiment';

const buildConstraints = (algo: any, params: string[]) => {
  const variable = algo.parameters.find((p: any) => params.includes(p.name));
  const variableTypes =
    variable &&
    variable.columnValuesSQLType.split(',').map((c: any) => c.trim());
  const variableColumnValuesIsCategorical =
    (variable && variable.columnValuesIsCategorical === 'true') || false;
  const variableConstraint: AlgorithmConstraintDetail = {
    binominal: variableColumnValuesIsCategorical,
    integer: variableTypes && variableTypes.includes('integer') ? true : false,
    polynominal: variableColumnValuesIsCategorical,
    real: variableTypes && variableTypes.includes('real') ? true : false
  };

  const minCount = variable.valueNotBlank ? 1 : 0;
  if (minCount > 0) {
    variableConstraint.min_count = minCount;
  }

  const maxCount = variable.valueMultiple ? 10 : 0;
  if (maxCount > 0) {
    variableConstraint.max_count = maxCount;
  }

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

const exaremeAlgorithms = (json: any): Algorithm[] =>
  json.map((algorithm: any) => {
    return {
      code: algorithm.name,
      constraints: {
        covariables: buildConstraints(algorithm, dependents),
        variable: buildConstraints(algorithm, independents)
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

const parse = (json: any) => exaremeAlgorithms(json);

const buildExaremeAlgorithmRequest = (
  model: ModelResponse,
  selectedMethod: Algorithm,
  newParams: AlgorithmParameter[]
) => {
  const params = [];
  let variableString;
  let covariablesArray: string[] = [];

  if (model.query.variables) {
    variableString = model.query.variables.map(v => v.code).toString();
  }

  if (model.query.coVariables) {
    covariablesArray = model.query.coVariables.map(v => v.code);
  }

  if (model.query.groupings) {
    covariablesArray = [
      ...covariablesArray,
      ...model.query.groupings.map(v => v.code)
    ];
  }

  let xCode = 'x';
  let yCode = 'y';

  switch (selectedMethod.code) {
    case 'VARIABLES_HISTOGRAM':
      xCode = 'column1';
      yCode = 'column2';
      break;
      break;

    case 'PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER':
    case 'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER':
      xCode = 'target_attributes';
      yCode = 'descriptive_attributes';
      break;

    default:
      break;
  }

  params.push({
    code: yCode,
    value: covariablesArray.toString()
  });

  params.push({
    code: xCode,
    value: variableString
  });

  const datasets = model.query.trainingDatasets;
  if (datasets) {
    const nextDatasets = datasets.map(v => v.code);
    params.push({
      code: 'dataset',
      value: nextDatasets.toString()
    });
  }

  const filters = model.query.filters;
  if (filters) {
    params.push({
      code: 'filter',
      value: filters
    });
  }

  const nextParams = params
    ? params.map((p: any) => ({
        ...p,
        value: p.value || p.default_value
      }))
    : [];

  return [...nextParams, ...newParams];
};

// FIXME: Results formats are inconsistant
const buildExaremeExperimentResponse = (
  resultParsed: any,
  experimentResponse: ExperimentResponse
) => {
  // Strip Model parameters
  experimentResponse.algorithms = experimentResponse.algorithms.map(a => {
    const parameters: AlgorithmParameter[] = a.parameters || [];

    return {
      ...a,
      parameters: parameters.filter(
        p =>
          ![...dependents, ...independents, 'dataset', 'filter'].includes(
            p.code
          )
      )
    };
  });

  console.log(experimentResponse);
  experimentResponse.results = [
    {
      methods: [
        {
          algorithm: experimentResponse.algorithms[0].name,
          mime: 'application/raw+json',
          data: resultParsed[0].result
        }
      ],
      name: 'local'
    }
  ];

  return experimentResponse;
};

export { parse, buildExaremeAlgorithmRequest, buildExaremeExperimentResponse };
