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

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'sgdLinearModel';
const parameters = [
  {
    code: 'alpha',
    value: '0.0001'
  },
  {
    code: 'penalty',
    value: 'l2'
  },
  {
    code: 'l1_ratio',
    value: '0.15'
  }
];
const kfold = {
  code: 'kfold',
  name: 'validation',
  parameters: [
    {
      code: 'k',
      value: '2'
    }
  ]
};
const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'lefthippocampus' }],
    groupings: [],
    testingDatasets: [],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    trainingDatasets: datasets
      .slice(0, datasets.length - 1)
      .map(d => ({ code: d.code })),
    validationDatasets: datasets
      .slice(datasets.length - 1)
      .map(d => ({ code: d.code })),
    variables: [{ code: 'subjectageyears' }]
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
  validations: [kfold]
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
    expect(wrapper.find('.pfa-table')).toHaveLength(1);
  });
});
