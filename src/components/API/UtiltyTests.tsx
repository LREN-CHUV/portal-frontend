import APIExperiment, {
  IExperiment,
  State as ExperimentState
} from './Experiment';
import config from './RequestHeaders';

const TIMEOUT_DURATION = 60 * 10;

const TEST_PATHOLOGIES = {
  dementia: {
    code: 'dementia',
    datasets: [
      {
        code: 'desd-synthdata'
      },
      { code: 'edsd' },
      { code: 'ppmi' },
      { code: 'fake_longitudinal' }
    ]
  },
  mentalhealth: {
    code: 'mentalhealth',
    datasets: [{ code: 'demo' }]
  },
  tbi: {
    code: 'tbi',
    datasets: [{ code: 'dummy_tbi' }]
  }
};

const apiExperiment = new APIExperiment(config);

const createExperiment = async ({
  experiment
}: {
  experiment: Partial<IExperiment>;
}): Promise<ExperimentState> => {
  await apiExperiment.create({ experiment, transient: false });
  await new Promise(resolve => setTimeout(resolve, 1000));

  return apiExperiment.state;
};

const waitForResult = ({ uuid }: { uuid: string }): Promise<ExperimentState> =>
  new Promise(resolve => {
    let elapsed = 0;
    const timerId = setInterval(async () => {
      await apiExperiment.get({ uuid });
      const { experiment } = apiExperiment.state;
      const loading = experiment
        ? !(experiment.status === 'error' || experiment.result)
        : true;

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

export { createExperiment, uid, waitForResult, TEST_PATHOLOGIES };
