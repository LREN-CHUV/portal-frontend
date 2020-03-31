import APICore, { AlgorithmParameter, VariableEntity } from '../Core';
import APIExperiment, {
  ExperimentPayload,
  State as ExperimentState
} from '../Experiment';
import APIModel, { ModelResponse, ModelState } from '../Model';
import config from '../RequestHeaders';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const TIMEOUT_DURATION = 60 * 10;

const RESEARCH_DATASETS = ['CHRU_Lille', 'clm', 'fbf'];

const getDatasets = async (
  researchOnly = true,
  code = 'dementia'
): Promise<VariableEntity[] | undefined> => {
  await apiCore.fetchPathologies();

  const datasets = apiCore.datasetsForPathology(code);

  return researchOnly
    ? datasets && datasets.filter(d => RESEARCH_DATASETS.includes(d.code))
    : datasets;
};

describe('Utils test', () => {
  const apiCore = new APICore(config);

  it('get datasets', async () => {
    const result = await getDatasets()
    expect(result).toBeTruthy();
    expect(result).toHaveLength(3);
  });
});

const createModel = async ({
  modelSlug,
  model
}: {
  modelSlug: string;
  model: any;
}): Promise<ModelState> => {
  await apiModel.save({ model, title: modelSlug });
  await new Promise(resolve => setTimeout(resolve, 1500));
  return apiModel.state;
};

const createWorkflowPayload = async (
  model: (datasets: VariableEntity[]) => ModelResponse,
  datasets: VariableEntity[],
  experimentCode: string,
  parameters: AlgorithmParameter[],
  modelSlug: string
): Promise<ExperimentPayload | void> => {
  await apiCore.algorithms();
  const algorithms = apiCore.state.algorithms || [];
  const selectedAlgorithm = algorithms.find(a => a.name === experimentCode);

  if (selectedAlgorithm) {
    const payload: ExperimentPayload = {
      algorithms: [
        {
          name: experimentCode,
          label: selectedAlgorithm.label,
          type: 'not yet implemented',
          parameters
        }
      ],
      model: modelSlug,
      label: selectedAlgorithm.label,
      name: experimentCode
    };

    return payload;
  }

  return;
};

const createExaremePayload = (
  model: (datasets: VariableEntity[]) => ModelResponse,
  datasets: VariableEntity[],
  experimentName: string,
  experimentLabel: string,
  parameters: AlgorithmParameter[],
  modelSlug: string,
  type: string
): any => {
  const query = model(datasets).query;
  const isVector = experimentName === 'TTEST_PAIRED';
  const varCount = (query.variables && query.variables.length) || 0;
  const isWorkflow = type === 'workflow';
  const nextParameters = [
    {
      name: 'y',
      label: 'y',
      value: isVector
        ? (query.variables &&
            query.variables // outputs: a1-a2,b1-b2, c1-a1
              .reduce(
                (vectors: string, v, i) =>
                  (i + 1) % 2 === 0
                    ? `${vectors}${v.code},`
                    : varCount === i + 1
                    ? `${vectors}${v.code}-${query.variables &&
                        query.variables[0].code}`
                    : `${vectors}${v.code}-`,
                ''
              )
              .replace(/,$/, '')) ||
          ''
        : (query.variables && query.variables.map(v => v.code).toString()) || ''
    },
    {
      name: 'dataset',
      label: 'dataset',
      value:
        (query.trainingDatasets &&
          query.trainingDatasets.map(v => v.code).toString()) ||
        ''
    },
    {
      name: 'pathology',
      label: 'pathology',
      value: (query.pathology && query.pathology.toString()) || ''
    },
    {
      name: 'filter',
      label: 'filter',
      value: (query.filters && query.filters) || ''
    }
  ];

  let covariablesArray =
    (query.coVariables && query.coVariables.map(v => v.code)) || [];
  covariablesArray = query.groupings
    ? [...covariablesArray, ...query.groupings.map(v => v.code)]
    : covariablesArray;

  if (covariablesArray.length > 0) {
    const value =
      experimentName === 'LINEAR_REGRESSION' || experimentName === 'ANOVA'
        ? covariablesArray.toString().replace(/,/g, '+')
        : covariablesArray.toString();

    nextParameters.push({ name: 'x', label: 'x', value });
  }

  const params = isWorkflow
    ? [...parameters]
    : [...parameters, ...nextParameters];

  const payload: ExperimentPayload = {
    algorithms: [
      {
        name: experimentName,
        label: experimentLabel,
        parameters: params,
        type
      }
    ],
    model: modelSlug,
    label: experimentLabel,
    name: experimentName
  };

  return payload;
};

const createExperiment = async ({
  experiment
}: {
  experiment: ExperimentPayload;
}): Promise<ExperimentState> => {
  await apiExperiment.create({ experiment });
  await new Promise(resolve => setTimeout(resolve, 1000));

  return apiExperiment.state;
};

const waitForResult = ({ uuid }: { uuid: string }): Promise<ExperimentState> =>
  new Promise(resolve => {
    let elapsed = 0;
    const timerId = setInterval(async () => {
      await apiExperiment.one({ uuid });
      const { experiment, error } = apiExperiment.state;
      const loading = experiment ? !(error || experiment.results) : true;

      if (!loading) {
        clearInterval(timerId);
        resolve(apiExperiment.state);
      }

      if (elapsed > TIMEOUT_DURATION) {
        // timeout
        clearInterval(timerId);
        // apiExperiment.state.error = `Timeout after ${TIMEOUT_DURATION} s`;
        resolve(apiExperiment.state);
      }

      elapsed = elapsed + 1;
    }, 1000);
  });

const uid = (): string =>
  'xxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });

export {
  createExperiment,
  createModel,
  createExaremePayload,
  createWorkflowPayload,
  getDatasets,
  uid,
  waitForResult
};
