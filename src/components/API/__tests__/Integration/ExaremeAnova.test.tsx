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
} from '../../Utils';

// config

const modelSlug = `anova-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'ANOVA';
const parameters = [
  { name: 'bins', value: '40' },
  { name: 'iterations_max_number', value: 20 },
  { name: 'sstype', value: 2 },
  { name: 'outputformat', value: 'pfa' },
  { name: 'pathology', value: 'dementia' }
];

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    pathology: 'dementia', // FIXME: should by dynamic
    coVariables: [],
    filters: '',
    groupings: [{ code: 'alzheimerbroadcategory' }],
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [
      {
        code: 'lefthippocampus'
      }
    ]
  }
});

// Test

describe('Integration Test for experiment API', () => {
  let datasets: VariableEntity[] | undefined;

  beforeAll(async () => {
    datasets = await getDatasets();
    expect(datasets).toBeTruthy();

    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });

    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return datasets !== undefined && mstate.model !== undefined;
  });

  it(`create ${experimentCode}`, async () => {
    if (!datasets) {
      throw new Error('datasets not defined');
    }
    const payload: ExperimentPayload = createExaremePayload(
      model,
      datasets,
      experimentCode,
      parameters,
      modelSlug,
      'iterative'
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
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toEqual('39.302');
  });
});
