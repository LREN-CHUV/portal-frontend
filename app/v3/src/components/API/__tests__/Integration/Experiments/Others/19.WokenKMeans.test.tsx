import { mount } from 'enzyme';
import Result from '../../../../../Experiment/Result/Result';
import { MIP } from '../../../../../../types';
import * as React from 'react';
import {
  createExperiment,
  createModel,
  datasets,
  waitForResult,
  uid
} from '../../../../../utils/TestUtils';

// config

const modelSlug = `model-${uid()}`;
const experimentCode = 'kmeans';
const parameters = [{ code: 'n_clusters', value: 3 }];
const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'lefthippocampus' }, { code: 'righthippocampus' }],
    groupings: [],
    testingDatasets: [],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    trainingDatasets: datasets.filter(d => !(/nida|qqni/.test(d.code))),
    validationDatasets: [],
    variables: [{ code: 'alzheimerbroadcategory' }]
  }
});

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

  it.skip(`create ${experimentCode}`, async () => {
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
  });
});
