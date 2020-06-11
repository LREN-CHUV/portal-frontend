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

const modelSlug = `calibration-belt-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'CALIBRATION_BELT';
const algorithmLabel = 'Calibration Belt';
const parameters = [
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
  }
];

const model: ModelResponse = {
  query: {
    pathology: TEST_PATHOLOGIES.tbi.code,
    coVariables: [
      {
        code: 'mortality_core'
      }
    ],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: TEST_PATHOLOGIES.tbi.datasets,
    validationDatasets: [],
    variables: [
      {
        code: 'mortality_gose'
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

it(`create ${algorithmId}`, async () => {
  const payload = await buildPayload(
    model,
    parameters as AlgorithmParameter[],
    algorithmId,
    algorithmLabel,
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
  expect(wrapper.find('.result')).toHaveLength(1);
  //   expect(
  //     wrapper
  //       .find('div.result table tbody tr td')
  //       .at(1)
  //       .text()
  //   ).toEqual('34.673');
});
});
