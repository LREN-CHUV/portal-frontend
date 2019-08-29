import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../Result/Result';
import {
  createExperiment,
  createModel,
  waitForResult
} from '../../../../utils/TestUtils';
import { VariableEntity } from '../../../Core';
import { buildExaremeAlgorithmRequest } from '../../../ExaremeAPIAdapter';
import { Engine } from '../../../Experiment';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'NAIVE_BAYES_TRAINING_STANDALONE';
const parameters: any = [
  {
    code: 'alpha',
    value: '0.1'
  }
];
const datasets = [{ code: 'adni' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'righthippocampus' }, { code: 'lefthippocampus' }],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets,
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
    const requestParameters = buildExaremeAlgorithmRequest(
      model(datasets),
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

    const experimentState = await waitForResult({ uuid });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = { experimentState };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div.result')).toHaveLength(1);
  });
});
