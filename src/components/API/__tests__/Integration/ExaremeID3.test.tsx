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

const modelSlug = `id3-${Math.round(Math.random() * 10000)}`;
const experimentName = 'ID3';
const algorithmId = 'ID3';
const parameters = [
  { name: 'iterations_max_number', value: 20, label: 'iterations_max_number' }
];

const model: ModelResponse = {
  query: {
    pathology: TEST_PATHOLOGIES.dementia.code,
    coVariables: [],
    filters: '',
    groupings: [{ code: 'agegroup' }, { code: 'gender' }],
    testingDatasets: [],
    trainingDatasets: TEST_PATHOLOGIES.dementia.datasets.filter(d => d.code !== 'fake_longitudinal'),
    validationDatasets: [],
    variables: [
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

    return;
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

    const experimentState = await waitForResult({
      uuid
    });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('.result')).toHaveLength(2);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(2)
        .text()
    ).toEqual('+80y');
  });
});
