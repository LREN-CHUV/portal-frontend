import APICore, { AlgorithmParameter, VariableEntity } from './Core';
import { buildExaremeAlgorithmRequest } from './ExaremeAPIAdapter';
import APIExperiment, {
  ExperimentPayload,
  State as ExperimentState
} from './Experiment';
import APIModel, { ModelState, ModelResponse } from './Model';
import config from './RequestHeaders';
import { Engine } from './Experiment';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const TIMEOUT_DURATION = 60 * 2;

// Tests utils

const RESEARCH_DATASETS = ['adni', 'ppmi', 'edsd'];

const getDatasets = async (
  researchOnly = true
): Promise<VariableEntity[] | undefined> => {
  await apiCore.datasets();
  const datasets = apiCore.state.datasets;

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
  getDatasets,
  uid,
  waitForResult
};
