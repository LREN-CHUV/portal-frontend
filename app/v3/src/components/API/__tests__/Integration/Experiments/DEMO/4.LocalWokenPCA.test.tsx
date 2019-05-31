import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../../Result/Result';
import {
    createExperiment, createModel, datasets, waitForResult
} from '../../../../../utils/TestUtils';
import { VariableEntity } from '../../../../Core';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'pca';
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'leftthalamusproper'
      },
      {
        code: 'leftacgganteriorcingulategyrus'
      },
      {
        code: 'leftententorhinalarea'
      },
      {
        code: 'leftmcggmiddlecingulategyrus'
      },
      {
        code: 'leftphgparahippocampalgyrus'
      },
      {
        code: 'leftpcggposteriorcingulategyrus'
      },
      {
        code: 'righthippocampus'
      },
      {
        code: 'rightthalamusproper'
      },
      {
        code: 'rightacgganteriorcingulategyrus'
      },
      {
        code: 'rightententorhinalarea'
      },
      {
        code: 'rightmcggmiddlecingulategyrus'
      },
      {
        code: 'rightphgparahippocampalgyrus'
      },
      {
        code: 'rightpcggposteriorcingulategyrus'
      }
    ],
    filters: '',
    groupings: [],
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

const payload: ExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode,
      parameters: [],
      validation: false
    }
  ],
  model: modelSlug,
  name: `${experimentCode}-${modelSlug}`,
  validations: []
};

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const dstate = await datasets();
    expect(dstate.error).toBeFalsy();
    expect(dstate.datasets).toBeTruthy();

    if (dstate.datasets) {
      const mstate = await createModel({
        model: model(dstate.datasets),
        modelSlug
      });
      expect(mstate.error).toBeFalsy();
      expect(mstate.model).toBeTruthy();

      return true;
    }
  });

  // Test

  it(`create ${experimentCode}`, async () => {
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

    expect(wrapper.find('.loader')).toHaveLength(0);
    expect(wrapper.find('.loader')).toHaveLength(0);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });
});
