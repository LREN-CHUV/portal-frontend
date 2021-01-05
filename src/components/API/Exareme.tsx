import { IExperimentPrototype, ExperimentParameter } from '../API/Experiment';
import { MIME_TYPES, ERRORS_OUTPUT, UI_HIDDEN_PARAMETERS } from '../constants';
import { AlgorithmParameter, Algorithm } from '../API/Core';

const handleParametersExceptions = (
  experiment: IExperimentPrototype
): IExperimentPrototype => {
  const parameters = experiment.algorithm.parameters;
  const selectedAlgorithm = experiment.algorithm;

  const covariables = parameters.find(p => p.name === 'x');
  const variables = parameters.find(p => p.name === 'y');

  const variablesArray = (variables?.value as string).split(',');
  const design = parameters.find(p => p.label === 'design');

  let exaremeParameters: ExperimentParameter[] = JSON.parse(
    JSON.stringify(parameters)
  );

  if (
    covariables &&
    design &&
    selectedAlgorithm.label !== 'Multiple Histograms' &&
    selectedAlgorithm.label !== 'CART' &&
    selectedAlgorithm.label !== 'ID3' &&
    selectedAlgorithm.label !== 'Naive Bayes Training'
  ) {
    covariables.value =
      design.value === 'additive'
        ? (covariables.value as string).replace(/,/g, '+')
        : (covariables.value as string).replace(/,/g, '*');
    exaremeParameters = exaremeParameters.map(p =>
      p.name === covariables.name ? covariables : p
    );
  }

  // outputs: a1-a2,b1-b2, c1-a1
  const isVector = selectedAlgorithm.label === 'T-Test Paired';
  const varCount = variablesArray?.length || 0;
  if (variables && isVector) {
    console.log(variables);
    variables.value = variablesArray
      ?.reduce(
        (vectors: string, v, i) =>
          (i + 1) % 2 === 0
            ? `${vectors}${v},`
            : varCount === i + 1
            ? `${vectors}${v}-${variablesArray[0]}`
            : `${vectors}${v}-`,
        ''
      )
      .replace(/,$/, '');

    exaremeParameters = exaremeParameters.map(p =>
      p.name === variables.name ? variables : p
    );
  }

  const e = {
    ...experiment,
    algorithm: {
      ...experiment.algorithm,
      parameters: exaremeParameters
    }
  };

  return e;
};

interface AlgorithmOutput {
  enabled: boolean;
  name?: string;
  types: MIME_TYPES[];
  label?: string;
}

export const ALGORITHMS_OUTPUT: AlgorithmOutput[] = [
  {
    enabled: true,
    name: 'ANOVA',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'LINEAR_REGRESSION',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'LOGISTIC_REGRESSION',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'TTEST_INDEPENDENT',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'TTEST_PAIRED',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'PEARSON_CORRELATION',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'ID3',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.JSON]
  },
  {
    enabled: true,
    name: 'KMEANS',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'NAIVE_BAYES_TRAINING',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'TTEST_ONESAMPLE',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: false,
    name: 'MULTIPLE_HISTOGRAMS',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'PCA',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Hold Out Validation',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Cross Validation',
    types: [MIME_TYPES.HIGHCHARTS, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'CALIBRATION_BELT',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'CART',
    types: [MIME_TYPES.JSON]
  },
  {
    enabled: true,
    name: 'KAPLAN_MEIER',
    // TODO: longitudinal datasets should be tagged
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'THREE_C',
    types: [MIME_TYPES.JSONDATA]
  }
].map(a => ({ ...a, types: [...ERRORS_OUTPUT, ...a.types] }));

// core
const defaultValueFor = ({
  label,
  defaults = {
    alpha: 0.1,
    kfold: 3,
    testSize: 0.2
  }
}: {
  label: string;
  defaults?: any;
}): string => {
  return defaults[label] ? defaults[label] : '';
};

const algorithmInputFilters = (json: Record<string, any>) => {
  const algorithms = json.filter(
    (algorithm: Algorithm) =>
      ALGORITHMS_OUTPUT.find(a => algorithm.name === a.name)?.enabled
  );

  const galaxyAlgorithms = json.filter(
    (algorithm: Algorithm) =>
      ALGORITHMS_OUTPUT.find(
        a => algorithm.type === 'workflow' && algorithm.label === a.label
      )?.enabled
  );

  const data = [...algorithms, ...galaxyAlgorithms];

  // FIXME: Algorithms defnition in Exareme will contains those extra parameters.
  const extraParametersData = data.map((algorithm: Algorithm) => ({
    ...algorithm,
    parameters: [
      ...(algorithm.parameters as AlgorithmParameter[]).map(
        (p: AlgorithmParameter) => {
          const visible = !UI_HIDDEN_PARAMETERS.includes(p.label || '');

          // Semantic adjustements:
          // For historical reason, exareme serves a "value" as a "defaultValue".
          // doesn't work for x,y,dataset and pathology. So we blank our "value", and
          // assign the default on the fly, if the user didn't provide it's own value
          // Exareme's "defaultValue" on an other hand is a placeholder, a recommendation

          const parameter = {
            ...p,
            value: visible ? p.value : '',
            defaultValue: p.value,
            placeholder: p.defaultValue,
            visible
          };

          if (parameter.label === 'standardize') {
            return {
              name: 'standardize',
              label: 'standardize',
              valueEnumerations: ['false', 'true'],
              defaultValue: 'false',
              value: 'false',
              desc: 'Standardize'
            };
          }

          return parameter;
        }
      ),
      // TODO: delete this once we have the formula
      ...(algorithm.label === 'ANOVA' || algorithm.label === 'Linear Regression'
        ? [
            {
              name: 'design',
              label: 'design',
              valueEnumerations: ['none', 'factorial', 'additive'],
              defaultValue: 'none',
              value: 'none',
              desc: 'Operator for the variables'
            }
          ]
        : [])
    ]
  }));

  const workflowParametersData = extraParametersData.map(
    (algorithm: Algorithm) => {
      if (algorithm.type === 'workflow') {
        return {
          ...algorithm,
          parameters: (algorithm.parameters as AlgorithmParameter[]).map(
            parameter => ({
              ...parameter,
              defaultValue: defaultValueFor({
                label: parameter.label || ''
              }),
              value: defaultValueFor({
                label: parameter.label || ''
              })
            })
          )
        };
      }

      return algorithm;
    }
  );

  return workflowParametersData;
};

export const Exareme = {
  algorithmInputFilters,
  handleParametersExceptions,
  ALGORITHMS_OUTPUT
};
