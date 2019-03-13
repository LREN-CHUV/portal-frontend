import { mount } from 'enzyme';
import Result from '../../../../../Experiment/Result/Result';
import { MIP } from '../../../../../../types';
import * as React from 'react';
import {
  createExperiment,
  createModel,
  waitForResult
} from '../../../../../utils/TestUtils';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'K_MEANS';
const parameters = [{ code: 'k', value: 4 }];
const datasets = [{ code: 'adni' }, { code: 'edsd' }];
const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'subjectageyears' }],
    groupings: [],
    testingDatasets: [],
    filters: '',
    trainingDatasets: datasets.map(d => ({ code: d.code })),
    validationDatasets: [],
    variables: [{ code: 'apoe4' }]
  }
});

const payload: MIP.API.IExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode, // FIXME: name is used to parse response which is bad !!!
      parameters,
      validation: false
    }
  ],
  model: modelSlug,
  name: `${experimentCode}-${modelSlug}`,
  validations: []
};

// Test

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });
    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return true;
  });

  it(`create ${experimentCode}`, async () => {
    const { error, experiment } = await createExperiment({
      experiment: payload
    });
    expect(error).toBeFalsy();
    expect(experiment).toBeTruthy();

    const uuid = experiment && experiment.uuid;
    expect(uuid).toBeTruthy();
    if (!uuid) {
      throw new Error('uuid not defined');
    }

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div#tabs-methods')).toHaveLength(1);
  });
});
