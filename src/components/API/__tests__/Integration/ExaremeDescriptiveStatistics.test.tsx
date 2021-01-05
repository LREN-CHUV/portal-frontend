import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../ExperimentResult/Result';
import {
  ExperimentParameter,
  IExperimentPrototype,
  IExperiment
} from '../../Experiment';
import {
  createExperiment,
  TEST_PATHOLOGIES,
  waitForResult
} from '../../UtiltyTests';

// config

const modelSlug = `statistics-${Math.round(Math.random() * 10000)}`;
const algorithmId = 'DESCRIPTIVE_STATS';

const parameters: ExperimentParameter[] = [
  {
    name: 'y', // variable
    value:
      'leftententorhinalarea,lefthippocampus,righthippocampus,rightpcggposteriorcingulategyrus,leftpcggposteriorcingulategyrus,rightacgganteriorcingulategyrus,leftacgganteriorcingulategyrus,rightmcggmiddlecingulategyrus,leftmcggmiddlecingulategyrus,rightphgparahippocampalgyrus,leftphgparahippocampalgyrus,rightententorhinalarea,rightthalamusproper,leftthalamusproper'
  },
  {
    name: 'pathology',
    value: TEST_PATHOLOGIES.dementia.code
  },
  {
    name: 'dataset',
    value: TEST_PATHOLOGIES.dementia.datasets
      .filter(d => d.code !== 'fake_longitudinal')
      .map(d => d.code)
      .toString()
  }
];

const experiment: IExperimentPrototype = {
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
    const { experiment: result } = await createExperiment({
      experiment
    });

    expect(result).toBeTruthy();
    expect(result.status).toStrictEqual('pending');

    const uuid = (result as IExperiment)?.uuid;
    expect(uuid).toBeTruthy();

    if (!uuid) {
      throw new Error('uuid not defined');
    }

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.experiment.status).toStrictEqual('success');
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };

    const r0 = experimentState?.experiment?.result;
    expect(
      r0![0].data?.single
        .rightphgparahippocampalgyrus.ppmi.num_datapoints
    ).toEqual(714);

    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('.result')).toHaveLength(1);
  });
});
