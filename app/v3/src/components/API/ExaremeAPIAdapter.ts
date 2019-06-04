import {
  Algorithm,
  AlgorithmConstraintParameter,
  AlgorithmParameter
} from './Core';
import { ExperimentResponse } from './Experiment';
import { ModelResponse } from './Model';
import { MIME_TYPES } from '../constants';

const independents = ['X', 'column1', 'x', 'descriptive_attributes'];
const dependents = ['Y', 'column2', 'y', 'target_attributes'];

const hiddenParameters = [
  'iterations_condition_query_provided',
  'outputformat'
];

const buildConstraints = (
  algo: any,
  params: string[],
  allowCategorical: boolean = true
) => {
  const variable = algo.parameters.find((p: any) => params.includes(p.name));

  if (!variable) return;
  const variableColumnValuesIsCategorical =
    (variable && variable.columnValuesIsCategorical === 'true') || false;

  if (variableColumnValuesIsCategorical && !allowCategorical) return;
  const variableTypes =
    variable &&
    variable.columnValuesSQLType.split(',').map((c: any) => c.trim());

  const variableConstraint: AlgorithmConstraintParameter = {
    binominal: variableColumnValuesIsCategorical,
    integer: variableTypes && variableTypes.includes('integer') ? true : false,
    polynominal: variableColumnValuesIsCategorical,
    real: variableTypes && variableTypes.includes('real') ? true : false
  };

  if (variable.valueNotBlank) {
    variableConstraint.min_count = 1;
  }

  if (!variable.valueMultiple) {
    variableConstraint.max_count = 1;
  }

  return variableConstraint;
};

const buildParameters = (algo: any) => {
  const parameters = algo.parameters.filter(
    (p: any) =>
      ![...dependents, ...independents, 'dataset', 'filter'].includes(p.name)
  );

  const params =
    (parameters &&
      parameters.map((parameter: any) => {
        const param: AlgorithmParameter = {
          code: parameter.name,
          constraints: {},
          default_value: parameter.value,
          description: parameter.desc,
          label: parameter.name,
          type: parameter.valueType,
          value: parameter.value,
          visible: hiddenParameters.includes(parameter.name) ? false : true
        };

        if (parameter.valueNotBlank) {
          param.constraints =
            parameter.valueType === 'string' || parameter.type === 'other'
              ? {
                  required: true
                }
              : {
                  min: 1
                };
        }

        if (parameter.type === 'other' && parameter.value === 'dummycoding') {
          param.type = 'enumeration';
          param.values = ['dummycoding', 'sumscoding', 'simplecoding'];
        }

        return param;
      })) ||
    [];

  return params;
};

const exaremeAlgorithmList = (json: any): Algorithm[] =>
  json.map((algorithm: any) => {
    return {
      code: algorithm.name,
      constraints: {
        covariables: buildConstraints(algorithm, dependents, false),
        variable: buildConstraints(algorithm, independents),
        groupings: buildConstraints(algorithm, dependents)
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

const parse = (json: any) => exaremeAlgorithmList(json);

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
    case 'PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER':
    case 'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER':
      xCode = 'target_attributes';
      yCode = 'descriptive_attributes';
      break;

    default:
      break;
  }

  if (covariablesArray.length > 0) {
    params.push({
      code: yCode,
      value: covariablesArray.toString()
    });
  }

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

const stripModelParameters = (
  experimentResponse: ExperimentResponse
): ExperimentResponse => {
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

  return experimentResponse;
};

const buildMimeType = (key: string, result: any) => {
  // console.log(result);

  if (result.error) {
    return {
      mime: MIME_TYPES.ERROR,
      error: result.error
    };
  }

  switch (key) {
    case 'HISTOGRAMS':
      return {
        mime: MIME_TYPES.HIGHCHARTS,
        data: [result]
      };

    case 'PEARSON_CORRELATION':
      return {
        mime: result.type,
        data: [result.data]
      };

    case 'ANOVA':
    case 'LINEAR_REGRESSION':
    case 'ID3':
      return {
        mime: MIME_TYPES.JSONDATA,
        data: [result.resources[0].data]
      };

    default:
      return {
        mime: MIME_TYPES.JSONRAW,
        data: result.result || result.resources
      };
  }
};

// FIXME: Results formats are inconsistant
const buildExaremeExperimentResponse = (
  resultParsed: any,
  experimentResponse: ExperimentResponse
) => {
  const nextExperimentResponse = stripModelParameters(experimentResponse);
  const name =
    nextExperimentResponse.algorithms.length > 0
      ? nextExperimentResponse.algorithms[0].code
      : '';
  nextExperimentResponse.results = [
    {
      algorithms: resultParsed.map((result: any) => {
        if (result.result) {
          return {
            name: result.name,
            ...result.result
              .filter((r: any) => r.type === MIME_TYPES.HIGHCHARTS)
              .map((r: any) => buildMimeType(name, r))[0]
          };
        }
        return {
          name: result.name,
          ...buildMimeType(name, result)
        };
      }),
      name: 'local'
    }
  ];
  // console.log(experimentResponse.results);

  return nextExperimentResponse;
};

export {
  parse,
  buildExaremeAlgorithmRequest,
  buildExaremeExperimentResponse,
  stripModelParameters
};
