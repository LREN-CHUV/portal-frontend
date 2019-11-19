import APIModel from '../../Model';
import APICore from '../../Core';
import config from '../../RequestHeaders';
import { getDatasets } from '../../Utils';

describe('Integration Test Model API', () => {
  const apiModel = new APIModel(config);
  let datasets, model;

  beforeAll(async () => {
    const apiCore = new APICore(config);
    datasets = await getDatasets();
    expect(datasets).toBeTruthy();

    model = {
      query: {
        coVariables: [{ code: 'alzheimerbroadcategory' }],
        groupings: [],
        testingDatasets: [],
        filters:
          '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
        trainingDatasets:
          (datasets && datasets.map(d => ({ code: d.code }))) || [],
        validationDatasets: [],
        variables: [{ code: 'lefthippocampus' }]
      }
    };

    return datasets;
  });

  it('create model', async () => {
    await apiModel.save({ model, title: 'model' });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
    model = result;
  });

  it('update model', async () => {
    await apiModel.update({ model });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it('get model', async () => {
    await apiModel.one('model');
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it('get all', async () => {
    await apiModel.all();
    const result = apiModel.state.models;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
