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

const modelSlug = `kaplan-meier-${Math.round(Math.random() * 10000)}`;
const experimentName = 'KAPLAN_MEIER';
const experimentLabel = 'Kaplan-Meier Estimator';
const parameters: any = [
  {
    name: 'outcome_pos',
    label: 'Positive outcome',
    value: 'AD'
  },
  {
    name: 'outcome_neg',
    label: 'Negative outcome',
    value: 'CN'
  },
  {
    name: 'max_age',
    label: 'Maximum age',
    value: '100'
  }
];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    // FIXME: should by dynamic
    coVariables: [],
    filters: '',
    groupings: [],
    pathology: 'dementia',
    testingDatasets: [],
    trainingDatasets: [{ code: 'fake_longitudinal' }],
    validationDatasets: [],
    variables: [
      {
        code: 'alzheimerbroadcategory'
      }
    ]
  }
});

// Test

describe('Integration Test for experiment API', () => {
  let datasets: VariableEntity[] | undefined;

  beforeAll(async () => {
    datasets = await getDatasets();
    datasets = datasets && datasets.filter((_, i) => i === 0);
    expect(datasets).toBeTruthy();

    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });

    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return datasets !== undefined && mstate.model !== undefined;
  });

  it(`create ${experimentName}`, async () => {
    if (!datasets) {
      throw new Error('datasets not defined');
    }
    const payload: ExperimentPayload = createExaremePayload(
      model,
      datasets,
      experimentName,
      experimentLabel,
      parameters,
      modelSlug,
      'python_local_global'
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
    expect(wrapper.find('div.result')).toHaveLength(1);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toEqual('-46.167');
  });
});
