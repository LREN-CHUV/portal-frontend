import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../ExperimentResult/Result';
import APICore from '../../Core';
import { ExperimentParameter, IExperiment } from '../../Experiment';
import config from '../../RequestHeaders';
import { createExperiment, TEST_PATHOLOGIES, waitForResult } from '../../UtiltyTests';

// config

const modelSlug = `naivebayes-${Math.round(Math.random() * 10000)}`;
//const algorithmId = 'c9468fdb6dc5c5f1';
const algorithmLabel = 'Naive Bayes with Cross Validation';
const parameters: ExperimentParameter[] = [
  { name: 'kfold', label: 'kfold', value: 3 },
  { name: 'alpha', label: 'alpha', value: 0.1 },
  {
    name: 'x', // covariable
    value: 'leftacgganteriorcingulategyrus,lefthippocampus'
  },
  {
    name: 'y', // variable
    value: 'alzheimerbroadcategory'
  },
  {
    name: 'pathology',
    value: TEST_PATHOLOGIES.dementia.code
  },
  {
    name: 'dataset',
    value: TEST_PATHOLOGIES.dementia.datasets
      .filter(d => d.code !== 'fake_longitudinal')
      .map(d => d.code)
      .toString()
  },
  {
    name: 'filter',
    value: ''
  }
];

let algorithmId: string | undefined;

// Test

describe('Integration Test for experiment API', () => {
   beforeAll(async () => {
     const apiCore = new APICore(config);
     await apiCore.algorithms();
     const result = apiCore.state.algorithms;
     const error = apiCore.state.error;
     expect(error).toBeFalsy();
     expect(result).toBeTruthy();

     algorithmId = result && result.find(a => a.label === algorithmLabel)?.name;
     expect(algorithmId).toBeTruthy();

     console.log(algorithmId)

     return;
   });

  it(`create ${algorithmId}`, async () => {

    const experiment: Partial<IExperiment> = {
      algorithm: {
        name: algorithmId!,
        parameters,
        type: 'string'
      },
      name: modelSlug
    };

    const { error, experiment: result } = await createExperiment({
      experiment
    });

    expect(error).toBeFalsy();
    expect(result).toBeTruthy();

    const uuid = result?.uuid;
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
