import APICore from '../API/Core';
import APIExperiment, {
  ExperimentPayload,
  State as ExperimentState
} from '../API/Experiment';
import APIModel, { ModelState } from '../API/Model';
import config from '../API/RequestHeaders';
import { State as CoreState } from '../API/Core';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const TIMEOUT_DURATION = 60 * 2;

const datasets = async (): Promise<CoreState> => {
  await apiCore.datasets();
  return apiCore.state;
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

export { createExperiment, createModel, datasets, uid, waitForResult };
