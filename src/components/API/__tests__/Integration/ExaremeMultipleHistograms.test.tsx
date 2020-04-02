import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../Result/Result';
import { AlgorithmParameter } from '../../Core';
import { ModelResponse } from '../../Model';
import {
  buildPayload,
  createExperiment,
  createModel,
  TEST_PATHOLOGIES,
  waitForResult
} from '../Utils';

// config

const modelSlug = `histograms-${Math.round(Math.random() * 10000)}`;
const experimentName = 'MULTIPLE_HISTOGRAMS';
const algorithmId = 'Multiple Histograms';

const parameters: Partial<AlgorithmParameter>[] = [
  {
    name: 'bins',
    value: '{ "lefthippocampus" : 35 }',
    label: 'bins'
  }
];

const model: ModelResponse = {
  query: {
    pathology: 'dementia',
    variables: [{ code: 'lefthippocampus' }],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: TEST_PATHOLOGIES.dementia.datasets,
    validationDatasets: [],
    coVariables: [
      {
        code: 'gender'
      },
      {
        code: 'alzheimerbroadcategory'
      }
    ]
  }
};

// Test

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const mstate = await createModel({
      model,
      modelSlug
    });

    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return mstate.model;
  });

  it(`create ${experimentName}`, async () => {
    const payload = await buildPayload(
      model,
      parameters as AlgorithmParameter[],
      experimentName,
      algorithmId,
      modelSlug
    );

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
    expect(wrapper.find('.result')).toHaveLength(3);
  });
});
