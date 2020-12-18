import APICore, { AlgorithmParameter, AlgorithmParameterRequest } from './Core';
import APIExperiment, {
  ExperimentPayload,
  State as ExperimentState
} from './Experiment';
import APIModel, { ModelResponse, ModelState } from './Model';
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

const apiCore = new APICore(config);
const apiModel = new APIModel(config);
const apiExperiment = new APIExperiment(config);

const createModel = async ({
  modelSlug,
  model
}: {
  modelSlug: string;
  model: any;
}): Promise<ModelState> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return apiModel.state;
};

/* const buildPayload = async (
  model: ModelResponse,
  parameters: AlgorithmParameter[],
  algorithmId: string,
  algorithmLabel: string,
  modelSlug: string
): Promise<ExperimentPayload> => {
  await apiCore.algorithms(true);

  const selectedAlgorithm = apiCore.state?.algorithms?.find(
    a => a.label === algorithmLabel
  );

  if (!selectedAlgorithm) {
    throw new Error('No algorithm selected');
  }

  const existingParameters = parameters.map(p => p.label);
  const mergedParameters = (selectedAlgorithm.parameters as AlgorithmParameter[]).map(
    a => {
      // Galaxy workaround. Takes name as a param
      const exist = existingParameters.includes(a.label);

      return exist
        ? (() => {
            const param = parameters.find(p => p.label === a.label)!;
            return {
              ...param,
              name: a.name
            };
          })()
        : a;
    }
  );

  const nextParameters: AlgorithmParameterRequest[] = apiExperiment.makeParameters(
    model,
    selectedAlgorithm,
    mergedParameters
  );

  const payload: ExperimentPayload = {
    algorithms: [
      {
        name: algorithmId,
        label: algorithmLabel,
        parameters: nextParameters,
        type: selectedAlgorithm.type
      }
    ],
    model: modelSlug,
    label: `${algorithmLabel}`,
    name: `${algorithmLabel}-${Math.round(Math.random() * 100)}`
  };

  return payload;
}; */

const createExperiment = async ({
  payload
}: {
  payload: ExperimentPayload;
}): Promise<ExperimentState> => {
  //await apiExperiment.create({ payload });
  await new Promise(resolve => setTimeout(resolve, 1000));

  return apiExperiment.state;
};

const waitForResult = ({ uuid }: { uuid: string }): Promise<ExperimentState> =>
  new Promise(resolve => {
    let elapsed = 0;
    const timerId = setInterval(async () => {
      await apiExperiment.get({ uuid });
      const { experiment, error } = apiExperiment.state;
      const loading = experiment ? !(error || experiment.result) : true;

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
  //buildPayload,
  createExperiment,
  createModel,
  uid,
  waitForResult,
  TEST_PATHOLOGIES
};
