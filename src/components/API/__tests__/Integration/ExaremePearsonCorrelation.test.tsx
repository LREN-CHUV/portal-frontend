import { mount, shallow } from 'enzyme';
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

const modelSlug = `pearson-${Math.round(Math.random() * 10000)}`;
const experimentName = 'PEARSON_CORRELATION';
const algorithmId = 'Pearson Correlation';
const parameters = [
  { name: 'bins', value: '40', label: 'bins' },
  { name: 'iterations_max_number', value: 20, label: 'iterations_max_number' },
  { name: 'sstype', value: 2, label: 'sstype' },
  { name: 'outputformat', value: 'pfa', label: 'outputformat' }
];

const model: ModelResponse = {
  query: {
    pathology: TEST_PATHOLOGIES.dementia.code,
    coVariables: [
      {
        code: 'lefthippocampus'
      }
    ],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: TEST_PATHOLOGIES.dementia.datasets.filter(d => d.code !== 'fake_longitudinal'),

    validationDatasets: [],
    variables: [
      {
        code: 'righthippocampus'
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

    const props = {
      experimentState
    };

    let wrapper: any = shallow(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    // expect(wrapper.find('.result')).toHaveLength(2);

    // Ensure Highchart is loading by catching error
    // Annoying highcharts Type error due to embbedding visualisation in algorithms output
    // FIXME: Exareme output as data

    expect(() => {
      wrapper = mount(<Result {...props} />);
    }).toThrow(TypeError);
  });
});
