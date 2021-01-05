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

const modelSlug = `pca-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'PCA';
const algorithmLabel = 'Principal Components analysis';

const parameters: ExperimentParameter[] = [
  { name: 'standardize', value: 'false', label: 'standardize' },
  { name: 'coding', value: 'null', label: 'coding' },
  {
    name: 'x', // covariable
    value: 'alzheimerbroadcategory'
  },
  {
    name: 'y', // variable
    value: 'lefthippocampus,rightthalamusproper,leftthalamusproper'
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
    expect(wrapper.find('.result')).toHaveLength(4);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toEqual('0.433');
  });
});
