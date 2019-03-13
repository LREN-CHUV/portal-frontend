import { mount } from 'enzyme';
import Result from '../../../../../Experiment/Result/Result';
import { MIP } from '../../../../../../types';
import * as React from 'react';
import {
  createExperiment,
  createModel,
  datasets,
  waitForResult
} from '../../../../../utils/TestUtils';

// Review December 2018 experiment

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'knn';
const model: any = (datasets: MIP.API.IVariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'subjectageyears'
      },
      {
        code: 'rightententorhinalarea'
      }
    ],
    filters: '',
    groupings: [
      {
        code: 'alzheimerbroadcategory'
      }
    ],
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [
      {
        code: 'righthippocampus'
      }
    ]
  }
});

const payload: MIP.API.IExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode,
      parameters: [],
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
  });
});
