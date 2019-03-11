import { MIP } from '../../types';
import APICore from '../API/Core';
import APIExperiment from '../API/Experiment';
import APIModel from '../API/Model';
import config from '../API/RequestHeaders';

const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);
const apiCore = new APICore(config);

const datasets = async () => {
  await apiCore.datasets();
  return apiCore.state;
};

const createModel = async ({
  modelSlug,
  model
}: {
  modelSlug: string;
  model: any;
}) => {
  await apiModel.save({ model, title: modelSlug });
  return apiModel.state;
};

const createExperiment = async ({
  experiment
}: {
  experiment: MIP.API.IExperimentPayload;
}) => {
  await apiExperiment.create({ experiment });
  return apiExperiment.state;
};

const waitForResult = ({ uuid }: { uuid: string }) : Promise<MIP.Store.IExperimentState > =>
  new Promise(resolve => {
    const timerId = setInterval(async () => {
      await apiExperiment.one({ uuid });
      const { experiment, error } = apiExperiment.state;
      const loading = experiment ? !(error || experiment.results) : true;
      if (!loading) {
        clearInterval(timerId);
        resolve(apiExperiment.state);
      }
    }, 1000);
  });

export { createExperiment, createModel, datasets, waitForResult };
