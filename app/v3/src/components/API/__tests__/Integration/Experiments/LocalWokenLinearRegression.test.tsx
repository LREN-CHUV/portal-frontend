import { mount } from 'enzyme';
import Result from '../../../../Experiment/Result/Result';
import { MIP } from '../../../../../types';
import * as React from 'react';
import {
  datasets,
  createExperiment,
  createModel,
  waitForResult
} from '../../../../utils/TestUtils';

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;

const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
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

const payload: MIP.API.IExperimentPayload = {
  algorithms: [
    {
      code: 'linearRegression',
      name: 'Linear Regression',
      parameters: [],
      validation: false
    }
  ],
  model: modelSlug,
  name: `Linear Regression-${modelSlug}`,
  validations: []
};

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const dstate = await datasets();
    expect(dstate.error).toBeFalsy();
    expect(dstate.datasets).toBeTruthy();

    if (dstate.datasets) {
      const mstate = await createModel({
        model: model(dstate.datasets),
        modelSlug
      });
      expect(mstate.error).toBeFalsy();
      expect(mstate.model).toBeTruthy();

      return true;
    }
  });

  it('create linear regression', async () => {
    const {
      error,
      experiment,
      experiment: { uuid }
    } = await createExperiment({ experiment: payload });
    expect(error).toBeFalsy();
    expect(experiment).toBeTruthy();

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div#tabs-methods')).toHaveLength(1);

    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(4)
        .text()
    ).toEqual('0.000 (***)');
  });
});
