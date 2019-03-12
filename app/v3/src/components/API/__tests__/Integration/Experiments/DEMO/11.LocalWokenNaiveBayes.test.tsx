import { mount } from 'enzyme';
import Result from '../../../../../Experiment/Result/Result';
import { MIP } from '../../../../../../types';
import * as React from 'react';
import {
  datasets,
  createExperiment,
  createModel,
  waitForResult
} from '../../../../../utils/TestUtils';

// Review December 2018 experiment

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'naiveBayes';
const parameters = [
  { code: 'alpha', value: '1' },
  { code: 'class_prior', value: '' }
];
const validations = [
  {
    code: 'kfold',
    name: 'validation',
    parameters: [
      {
        code: 'k',
        value: '4'
      }
    ]
  }
];
const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [
      { code: 'lefthippocampus' },
      { code: 'rightententorhinalarea' }
    ],
    groupings: [],
    testingDatasets: [],
    filters: '',
    trainingDatasets: datasets.map(d => ({ code: d.code })),
    validationDatasets: [],
    variables: [{ code: 'righthippocampus' }]
  }
});

const payload: MIP.API.IExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode,
      parameters,
      validation: false
    }
  ],
  model: modelSlug,
  name: `${experimentCode}-${modelSlug}`,
  validations
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

  // Test

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
    expect(wrapper.find('.greyGridTable')).toHaveLength(1);
    // expect(
    //   wrapper
    //     .find('.greyGridTable tbody tr td')
    //     .at(4)
    //     .text()
    // ).toEqual('0.000 (***)');
  });
});
