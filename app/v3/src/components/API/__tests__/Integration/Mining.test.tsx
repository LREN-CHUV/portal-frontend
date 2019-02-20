import APIMining from '../../Mining';
import APIModel from '../../Model';
import config from '../../RequestHeaders';

describe('Test Mining API', () => {
  const apiMining = new APIMining(config);
  let model;

  beforeAll(async () => {
    const apiModel = new APIModel(config);
    await apiModel.one('model');
    model = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(model).toBeTruthy();

    return model;
  });

  it('create mining', async () => {
    const query = model.query;
    const payload = {
      covariables: query.coVariables ? query.coVariables : [],
      datasets: [query.trainingDatasets.pop()], // load one dataset only
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
});
