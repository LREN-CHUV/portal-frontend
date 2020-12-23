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

const modelSlug = `3c-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'THREE_C';
const algorithmLabel = '3C';

const parameters: ExperimentParameter[] = [
  { "name": "dx", "value": "alzheimerbroadcategory" },
  { "name": "c2_feature_selection_method", "value": "RF" },
  { "name": "c2_num_clusters_method", "value": "Euclidean" },
  { "name": "c2_num_clusters", "value": "6" },
  { "name": "c2_clustering_method", "value": "Euclidean" },
  { "name": "c3_feature_selection_method", "value": "RF" },
  { "name": "c3_classification_method", "value": "RF" },
  {
    name: 'x', // covariable
    value: 'gender, agegroup'
  },
  {
    name: 'y', // variable
    value: 'lefthippocampus,righthippocampus,leftcaudate'
  },
  {
    name: 'pathology',
    value: TEST_PATHOLOGIES.dementia.code
  },
  {
    name: 'dataset',
    value: TEST_PATHOLOGIES.dementia.datasets
      .filter(d => d.code === 'ppmi' || d.code === 'edsd')
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
    expect(
      wrapper
        .find('div.result table tbody tr td')
        .at(1)
        .text()
    ).toBeTruthy();
  });
});
