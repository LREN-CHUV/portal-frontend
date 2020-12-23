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

const modelSlug = `calibration-belt-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'CALIBRATION_BELT';
const algorithmLabel = 'Calibration Belt';
const parameters: ExperimentParameter[] = [
  {
    name: 'devel',
    label: 'devel',
    value: 'external'
  },
  {
    name: 'max_deg',
    label: 'max_deg',
    value: '4'
  },
  {
    name: 'confLevels',
    label: 'confLevels',
    value: '0.80, 0.95'
  },
  {
    name: 'thres',
    label: 'thres',
    value: '0.95'
  },
  {
    name: 'num_points',
    label: 'num_points',
    value: '200'
  },
  {
    name: 'x', // covariable
    value: 'mortality_core'
  },
  {
    name: 'y', // variable
    value: 'mortality_gose'
  },
  {
    name: 'pathology',
    value: TEST_PATHOLOGIES.tbi.code
  },
  {
    name: 'dataset',
    value: TEST_PATHOLOGIES.tbi.datasets
      .filter(d => d.code !== 'fake_longitudinal')
      .map(d => d.code)
      .toString()
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
    expect(wrapper.find('.result')).toHaveLength(1);
    //   expect(
    //     wrapper
    //       .find('div.result table tbody tr td')
    //       .at(1)
    //       .text()
    //   ).toEqual('34.673');
  });
});
