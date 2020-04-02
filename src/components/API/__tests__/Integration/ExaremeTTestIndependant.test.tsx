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

const modelSlug = `ttest-i-${Math.round(Math.random() * 10000)}`;
const experimentName = 'TTEST_INDEPENDENT';
const algorithmId = 'T-Test Independent';
const parameters: any = [
  { name: 'xlevels', value: 'M,F', label: 'xlevels' },
  { name: 'testvalue', value: '3.0', label: 'testvalue' },
  {
    name: 'hypothesis',
    value: 'greaterthan',
    label: 'hypothesis'
  },
  {
    name: 'effectsize',
    value: '1',
    label: 'effectsize'
  },
  {
    name: 'ci',
    value: '1',
    label: 'ci'
  },
  {
    name: 'meandiff',
    value: '1',
    label: 'meandiff'
  },
  { 
    name: 'pathology', 
    value: 'dementia', 
    label: 'pathology' 
  }
];
const model: ModelResponse = {
  query: {
    pathology: TEST_PATHOLOGIES.dementia.code,
    coVariables: [
      {
        code: 'gender'
      }
    ],
    filters: '',
    groupings: [],
    testingDatasets: [],
        trainingDatasets: TEST_PATHOLOGIES.dementia.datasets.filter(d => d.code !== 'fake_longitudinal'),

    validationDatasets: [],
    variables: [
      {
        code: 'rightpcggposteriorcingulategyrus'
      },
      {
        code: 'leftpcggposteriorcingulategyrus'
      },
      {
        code: 'rightacgganteriorcingulategyrus'
      },
      {
        code: 'leftacgganteriorcingulategyrus'
      },
      {
        code: 'rightmcggmiddlecingulategyrus'
      },
      {
        code: 'leftmcggmiddlecingulategyrus'
      },
      {
        code: 'rightphgparahippocampalgyrus'
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

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div.result')).toHaveLength(1);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toEqual('18.477');
  });
});
