import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../../Result/Result';
import {
  createExperiment,
  createModel,
  waitForResult
} from '../../../../../utils/TestUtils';
import { VariableEntity } from '../../../../Core';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER';
const datasets = [{ code: 'adni' }, { code: 'edsd' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'apoe4'
      },
      {
        code: 'av45'
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
        code: 'subjectageyears'
      }
    ]
  }
});

const payload: ExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode, // FIXME: name is used to parse response which is bad !!!
      parameters: [],
      validation: false
    }
  ],
  model: modelSlug,
  name: `${experimentCode}-${modelSlug}`,
  validations: []
};

// Test

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });
    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return true;
  });

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
    // We test if the script was evaluated, which should throw an error
    // in this test context. Should be fixed in exareme response API
    expect(() => mount(<Result {...props} />)).toThrow(TypeError);
  });
});
