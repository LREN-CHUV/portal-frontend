import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../ExperimentResult/Result';
import {
  ExperimentParameter,
  IExperiment,
  IExperimentPrototype
} from '../../Experiment';
import {
  createExperiment,
  TEST_PATHOLOGIES,
  waitForResult
} from '../../UtiltyTests';

// config

const modelSlug = `ttest-idp-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'TTEST_INDEPENDENT';
const algorithmLabel = 'T-Test Independent';

const parameters: ExperimentParameter[] = [
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
    name: 'x', // covariable
    value: 'gender'
  },
  {
    name: 'y', // variable
    value:
      'rightpcggposteriorcingulategyrus,leftpcggposteriorcingulategyrus,rightacgganteriorcingulategyrus,leftacgganteriorcingulategyrus,rightmcggmiddlecingulategyrus,leftmcggmiddlecingulategyrus,rightphgparahippocampalgyrus'
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

const experiment: IExperimentPrototype = {
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
    const { experiment: result } = await createExperiment({
      experiment
    });

    expect(result).toBeTruthy();
    expect(result.status).toStrictEqual('pending');

    const uuid = (result as IExperiment)?.uuid;
    expect(uuid).toBeTruthy();

    if (!uuid) {
      throw new Error('uuid not defined');
    }

    const experimentState = await waitForResult({ uuid });

    expect(experimentState.experiment.status).toStrictEqual('success');
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
