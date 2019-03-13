import APIMining from '../../Mining';
import { MIP } from '../../../../types';
import config from '../../RequestHeaders';
import { datasets, createModel } from '../../../utils/TestUtils';

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const buildModel: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'alzheimerbroadcategory' }],
    groupings: [],
    testingDatasets: [],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    trainingDatasets: datasets.map(d => ({ code: d.code })),
    validationDatasets: [],
    variables: [{ code: 'lefthippocampus' }]
  }
});

describe('Integration Test Mining API', () => {
  const apiMining = new APIMining(config);
  let model: any;

  beforeAll(async () => {
    const dstate = await datasets();
    expect(dstate.error).toBeFalsy();
    expect(dstate.datasets).toBeTruthy();

    if (dstate.datasets) {
      model = buildModel(dstate.datasets);
      const mstate = await createModel({
        model,
        modelSlug
      });
      expect(mstate.error).toBeFalsy();
      expect(mstate.model).toBeTruthy();

      return true;
    }
  });

  it('create mining', async () => {
    const query = model.query;
    const payload = {
      covariables: query.coVariables ? query.coVariables : [],
      datasets: [[...query.trainingDatasets].pop()], // load one dataset only
      filters: query.filters,
      grouping: query.groupings ? query.groupings : [],
      variables: query.variables ? query.variables : []
    };
    await apiMining.allByDataset({ payload });
    let { minings, error } = apiMining.state;

    const timer = new Promise(resolve => {
      const timerId = setInterval(async () => {
        const { minings, error } = apiMining.state;
        const loading = !(error || minings);
        if (!loading) {
          clearInterval(timerId);
          resolve();
        }
      }, 1000);
    });

    await timer;

    expect(error).toBeFalsy();
    expect(minings).toBeTruthy();
  });

  it('get heatmap', async () => {
    const query = model.query;
    const payload = {
      covariables: query.coVariables ? query.coVariables : [],
      datasets: query.trainingDatasets, // load one dataset only
      filters: query.filters,
      grouping: query.groupings ? query.groupings : [],
      variables: query.variables ? query.variables : []
    };
    await apiMining.heatmaps({ payload });
    let { heatmaps, error } = apiMining.state;

    const timer = new Promise(resolve => {
      const timerId = setInterval(async () => {
        const { heatmaps, error } = apiMining.state;
        const loading =
          error !== undefined &&
          heatmaps !== undefined &&
          heatmaps.map(h => h.data).includes(undefined);
        if (!loading) {
          clearInterval(timerId);
          resolve();
        }
      }, 1000);
    });

    await timer;

    expect(error).toBeFalsy();
    expect(heatmaps).toBeTruthy();

    const data = heatmaps.every(h => h.data !== undefined);
    const dataError = heatmaps && [...heatmaps][0].error;

    expect(dataError).toBeFalsy();
    expect(data).toBeTruthy();
  });
});
