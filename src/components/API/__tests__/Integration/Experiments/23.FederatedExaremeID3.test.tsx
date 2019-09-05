import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../Result/Result';
import { createExperiment, createModel, waitForResult } from '../../../../utils/TestUtils';
import { VariableEntity } from '../../../Core';
import { buildExaremeAlgorithmRequest } from '../../../ExaremeAPIAdapter';
import { Engine } from '../../../Experiment';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'ID3';
const parameters = [
  { code: 'iterations_max_number', value: 20 },
];
const model: any = () => ({
  query: {
    coVariables: [],
    filters: '',
    groupings: [
      { code: 'alzheimerbroadcategory' }
    ],
    testingDatasets: [],
    trainingDatasets: [{ code: 'adni' }],
    validationDatasets: [],
    variables: [
      {
        code: 'neurodegenerativescategories'
      }
    ]
  }
});

// Test

describe('Integration Test for experiment API', () => {
  beforeAll(async () => {
    const mstate = await createModel({
      model: model(),
      modelSlug
    });
    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return true;
  });

  it(`create ${experimentCode}`, async () => {
    const requestParameters = buildExaremeAlgorithmRequest(
      model(),
      {
        code: experimentCode
      },
      parameters
    );

    const payload: ExperimentPayload = {
      algorithms: [
        {
          code: experimentCode,
          name: experimentCode, // FIXME: name is used to parse response which is bad !!!
          parameters: requestParameters,
          validation: false
        }
      ],
      model: modelSlug,
      name: `${experimentCode}-${modelSlug}`,
      validations: [],
      engine: Engine.Exareme
    };

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

    const experimentState = await waitForResult({
      uuid
    });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();
  });
});
