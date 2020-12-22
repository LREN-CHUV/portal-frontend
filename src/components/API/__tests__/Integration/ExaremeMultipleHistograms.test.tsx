import { mount } from 'enzyme';
import * as React from 'react';
import { IExperiment, ExperimentParameter } from '../../Experiment';
import {
  createExperiment,
  TEST_PATHOLOGIES,
  waitForResult
} from '../../UtiltyTests';
import Result from '../../../ExperimentResult/Result'

// config

const modelSlug = `histograms-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'MULTIPLE_HISTOGRAMS';

const parameters: ExperimentParameter[] = [
  {
    name: 'bins',
    value: '{ "lefthippocampus" : 35 }'
  },
  {
    name: 'x', // covariable
    value: 'gender, alzheimerbroadcategory'
  },
  {
    name: 'y', // variable
    value: 'lefthippocampus'
  },
  {
    name: 'pathology',
    value: TEST_PATHOLOGIES.dementia.code
  },
  {
    name: 'dataset',
    value: TEST_PATHOLOGIES.dementia.datasets.filter(
      d => d.code !== 'fake_longitudinal'
    ).map(d => d.code).toString()
  }
];

const experiment: Partial<IExperiment> = {
  algorithm: {
    name: algorithmId,
    parameters,
    type: 'string'
  },
  name: modelSlug
};

// Test

describe('Integration Test for experiment API', () => {

  it(`create ${algorithmId}`, async () => {
    
    const { error, experiment: result } = await createExperiment({
      experiment
    });

    expect(error).toBeFalsy();
    expect(result).toBeTruthy();

    const uuid = result && result.uuid;
    expect(uuid).toBeTruthy();
    if (!uuid) {
      throw new Error('uuid not defined');
    }

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    console.log(wrapper.debug())
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('.result')).toHaveLength(3);
  });
});
