import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../Result/Result';
import { VariableEntity } from '../../Core';
import { ExperimentPayload } from '../../Experiment';
import {
  createExaremePayload,
  createExperiment,
  createModel,
  getDatasets,
  waitForResult
} from '../Utils';

// config

const modelSlug = `calibration-belt-${Math.round(Math.random() * 10000)}`;
const experimentName = 'CALIBRATION_BELT';
const experimentLabel = 'Calibration Belt';
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

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    pathology: 'tbi', // FIXME: should by dynamic
    coVariables: [
      {
        code: 'impact_prob_core_mortality'
      }
    ],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets,
    validationDatasets: [],
    variables: [
      {
        code: 'Mortality'
      }
    ]
  }
});

// Test

describe('Integration Test for experiment API', () => {
  let datasets: VariableEntity[] | undefined = [{ code: 'demo1' }];

  beforeAll(async () => {
    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });

    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return;
  });

  it(`create ${experimentName}`, async () => {
    const payload: ExperimentPayload = createExaremePayload(
      model,
      datasets,
      experimentName,
      experimentLabel,
      parameters,
      modelSlug,
      'python_iterative'
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
