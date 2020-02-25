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

const modelSlug = `naivebayes-${Math.round(Math.random() * 10000)}`;
const experimentName = 'f2db41e1fa331b3e';
const experimentLabel = 'Naive Bayes with Cross Validation';
const parameters = [
  {
    name: 'd8ded1b9-5e2a-4c55-9a9d-60d74ec940a2',
    value: '0',
    label: 'alpha'
  },
  {
    name: '59093696-f570-4549-806d-15c55f468a4d',
    value: '3',
    label: 'kfold'
  },
  {
    name: 'dd7c6242-1b48-4bcd-8b21-ca9fb6bda7f5',
    value: 'dementia',
    label: 'pathology'
  },
  {
    name: 'a9a57dff-1f53-4936-9f1d-cefd1a1f209b',
    value: 'adni',
    label: 'dataset'
  },
  {
    name: '5f04f970-86d8-49be-a4ff-ccba18f8fee4',
    value: 'leftacgganteriorcingulategyrus,lefthippocampus',
    label: 'x'
  },
  {
    name: 'fb380ae5-2923-4dde-a811-75fcc84914d7',
    value: 'alzheimerbroadcategory',
    label: 'y'
  },
  {
    name: '0f6fb62f-238c-404e-b636-230bd0b60207',
    value: '',
    label: 'filter'
  }
];

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    // FIXME: should by dynamic
    coVariables: [
      { code: 'leftacgganteriorcingulategyrus' },
      { code: 'lefthippocampus' }
    ],
    filters: '',
    groupings: [],
    pathology: 'dementia',
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
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
      'workflow'
    );
    console.log(JSON.stringify(payload));
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
    expect(wrapper.find('.result')).toHaveLength(3);
  });
});
