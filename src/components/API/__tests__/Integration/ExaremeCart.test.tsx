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

const modelSlug = `cart-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'CART';
const algorithmLabel = 'CART';

const parameters: ExperimentParameter[] = [
  { name: 'max_depth', value: '3', label: 'max_depth' },
  { name: 'no_split_points', value: '10', label: 'max_depth' },

  {
    name: 'x', // covariable
    value: 'lefthippocampus,righthippocampus'
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
    const r0 = experimentState?.experiment?.result;
    expect(r0![0].data?.gain).toEqual(0.6142216049382716);
  });
});
