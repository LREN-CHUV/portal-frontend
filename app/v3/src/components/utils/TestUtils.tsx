import APICore from '../API/Core';
import APIExperiment, { ExperimentPayload, State } from '../API/Experiment';
import APIModel from '../API/Model';
import config from '../API/RequestHeaders';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const TIMEOUT_DURATION = 60 * 2;

const datasets = async () => {
  await apiCore.datasets();
  return apiCore.state;
};

const createModel = async ({ modelSlug, model }: { modelSlug: string; model: any }) => {
  await apiModel.save({ model, title: modelSlug });
  return apiModel.state;
};

const createExperiment = async ({ experiment }: { experiment: ExperimentPayload }) => {
  await apiExperiment.create({ experiment });
  return apiExperiment.state;
};

const waitForResult = ({ uuid }: { uuid: string }): Promise<State> =>
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
        apiExperiment.state.error = `Timeout after ${TIMEOUT_DURATION} s`;
        resolve(apiExperiment.state);
      }

      elapsed = elapsed + 1;
    }, 1000);
  });

const uid = () =>
  'xxxxxxxx'.replace(/[xy]/g, c => {
    // tslint:disable
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    // tslint:enable
    return v.toString(16);
  });

export { createExperiment, createModel, datasets, uid, waitForResult };
