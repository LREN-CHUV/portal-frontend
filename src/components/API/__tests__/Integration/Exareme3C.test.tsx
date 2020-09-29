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
} from '../../Utils';

// config

const modelSlug = `3c-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'THREE_C';
const algorithmLabel = '3C';
const parameters = [
   {"name": "dataset", "value": "ppmi, edsd"},
   {"name": "dx", "value": "alzheimerbroadcategory"},
   {"name": "c2_feature_selection_method", "value": "RF"},
   {"name": "c2_num_clusters_method", "value": "Euclidean"},
   {"name": "c2_num_clusters", "value": "6"},
   {"name": "c2_clustering_method", "value": "Euclidean"},
   {"name": "c3_feature_selection_method", "value": "RF"},
   {"name": "c3_classification_method", "value": "RF"},
];

const model: ModelResponse = {
  query: {
    pathology: TEST_PATHOLOGIES.dementia.code,
    coVariables: [
      {
        code: 'gender'
      },
      {
        code: 'agegroup'
      }
    ],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: TEST_PATHOLOGIES.dementia.datasets.filter(
      d => d.code !== 'fake_longitudinal'
    ),
    validationDatasets: [],
    variables: [
      { code: 'lefthippocampus' },
      { code: 'righthippocampus' },
      { code: 'leftcaudate' }
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

    return
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
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toBeTruthy();
  });
});
