import APICore, { VariableEntity } from '../../Core';
import APIMining from '../../Mining';
import config from '../../RequestHeaders';
import { createModel } from '../../Utils';

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const buildModel: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'alzheimerbroadcategory'
      }
    ],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [
      {
        code: 'lefthippocampus'
      }
    ]
  }
});

describe.skip('Integration Test Mining API', () => {
  const apiMining = new APIMining(config);
  const apiCore = new APICore(config);
  let model: any;

  beforeAll(async () => {
    await apiCore.datasets();
    const dstate = apiCore.state;
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
    await apiMining.summaryStatisticsByDataset({ payload });
    const { summaryStatistics: minings, error } = apiMining.state;

    const timer = new Promise(resolve => {
      const timerId = setInterval(async () => {
        const { summaryStatistics: minings, error } = apiMining.state;
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
});
