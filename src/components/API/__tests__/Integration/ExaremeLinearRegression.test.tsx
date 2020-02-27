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

const modelSlug = `linear-${Math.round(Math.random() * 10000)}`;
const experimentName = 'LINEAR_REGRESSION';
const experimentLabel = 'Linear Regression'
const parameters = [
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
  { name: 'pathology', label: 'pathology', value: 'dementia' }
];

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    // FIXME: should by dynamic
    coVariables: [
      {
        code: 'leftpcuprecuneus'
      }
    ],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    groupings: [],
    pathology: 'dementia',
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
    expect(wrapper.find('.result')).toHaveLength(2);
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .first()
        .text()
    ).toEqual('1.080');
    expect(
      wrapper
        .find('div.result')
        .at(1)
        .find('table tbody tr td')
        .at(1)
        .first()
        .text()
    ).toEqual('-0.942');
  });
});
