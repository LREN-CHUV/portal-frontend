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

const modelSlug = `ttest-i-${Math.round(Math.random() * 10000)}`;
const experimentName = 'TTEST_INDEPENDENT';
const experimentLabel = 'T-Test Independent';
const parameters: any = [
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
    name: 'pathology', 
    value: 'dementia', 
    label: 'pathology' 
  }
];
const datasets = [{ code: 'adni' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'gender'
      }
    ],
    filters: '',
    groupings: [],
    pathology: 'dementia',
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    // FIXME: should by dynamic
    variables: [
      {
        code: 'rightpcggposteriorcingulategyrus'
      },
      {
        code: 'leftpcggposteriorcingulategyrus'
      },
      {
        code: 'rightacgganteriorcingulategyrus'
      },
      {
        code: 'leftacgganteriorcingulategyrus'
      },
      {
        code: 'rightmcggmiddlecingulategyrus'
      },
      {
        code: 'leftmcggmiddlecingulategyrus'
      },
      {
        code: 'rightphgparahippocampalgyrus'
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
      'multiple_local_global'
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
    ).toEqual('22.512');
  });
});
