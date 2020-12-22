import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../ExperimentResult/Result';
import { ExperimentParameter, IExperiment } from '../../Experiment';
import {
  createExperiment,
  TEST_PATHOLOGIES,
  waitForResult
} from '../../UtiltyTests';

// config

const modelSlug = `linear-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'LINEAR_REGRESSION';
const algorithmLabel = 'Linear Regression';
const parameters: ExperimentParameter[] = [
  {
    name: 'referencevalues',
    label: 'referencevalues',
    value: '[{"name":"alzheimerbroadcategory","val":"Other"}]'
  },
  {
    name: 'encodingparameter',
    label: 'encodingparameter',
    value: 'dummycoding'
  },
  {
    name: 'x', // covariable
    value: 'leftpcuprecuneus'
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
    value: TEST_PATHOLOGIES.dementia.datasets
      .filter(d => d.code !== 'fake_longitudinal')
      .map(d => d.code)
      .toString()
  },
  {
    name: 'filter',
    value:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}'
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
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('.result')).toHaveLength(2);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .first()
        .text()
    ).toEqual('0.986');
    expect(
      wrapper
        .find('div.result')
        .at(1)
        .find('table tbody tr td')
        .at(1)
        .first()
        .text()
    ).toEqual('-1.478');
  });
});
