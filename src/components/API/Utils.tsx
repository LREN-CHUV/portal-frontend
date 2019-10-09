import APICore, { AlgorithmParameter, VariableEntity } from './Core';
import { buildExaremeAlgorithmRequest } from './ExaremeAPIAdapter';
import APIExperiment, {
  Engine,
  ExperimentPayload,
  State as ExperimentState
} from './Experiment';
import { buildWorkflowAlgorithmRequest } from './WorkflowAPIAdapter';
import APIModel, { ModelResponse, ModelState } from './Model';
import config from './RequestHeaders';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const TIMEOUT_DURATION = 60 * 2;

// Tests utils

const RESEARCH_DATASETS = ['adni', 'ppmi', 'edsd'];

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

const createModel = async ({
  modelSlug,
  model
}: {
  modelSlug: string;
  model: any;
}): Promise<ModelState> => {
  await apiModel.save({ model, title: modelSlug });
  return apiModel.state;
};

const createWorkflowPayload = async (
  model: (datasets: VariableEntity[]) => ModelResponse,
  datasets: VariableEntity[],
  experimentCode: string,
  parameters: AlgorithmParameter[],
  modelSlug: string
): Promise<ExperimentPayload | void> => {
  await apiCore.algorithms(false);
  const algorithms = apiCore.state.algorithms || [];
  const selectedAlgorithm = algorithms.find(a => a.code === experimentCode);

  if (selectedAlgorithm) {
    const requestParameters = buildWorkflowAlgorithmRequest(
      model(datasets),
      selectedAlgorithm,
      parameters
    );

    const payload: ExperimentPayload = {
      algorithms: [
        {
          code: experimentCode,
          name: experimentCode,
          parameters: requestParameters,
          validation: false
        }
      ],
      model: modelSlug,
      name: experimentCode,
      validations: [],
      engine: Engine.Workflow
    };

    return payload;
  }

  return;
};

const createExaremePayload = (
  model: (datasets: VariableEntity[]) => ModelResponse,
  datasets: VariableEntity[],
  experimentCode: string,
  parameters: AlgorithmParameter[],
  modelSlug: string
): ExperimentPayload => {
  const requestParameters = buildExaremeAlgorithmRequest(
    model(datasets),
    { code: experimentCode, name: experimentCode, validation: false },
    parameters
  );

  const payload: ExperimentPayload = {
    algorithms: [
      {
        code: experimentCode,
        name: experimentCode,
        parameters: requestParameters,
        validation: false
      }
    ],
    model: modelSlug,
    name: experimentCode,
    validations: [],
    engine: Engine.Exareme
  };

  return payload;
};

const createExperiment = async ({
  experiment
}: {
  experiment: ExperimentPayload;
}): Promise<ExperimentState> => {
  await apiExperiment.create({ experiment });
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
