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

// Review December 2018 experiment

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'LINEAR_REGRESSION';
const parameters = [
  {
    code: 'referencevalues',
    value: '[{"name":"alzheimerbroadcategory","val":"Other"}]'
  },
  { code: 'encodingparameter', value: 'dummycoding' }
];
const datasets = [{ code: 'adni' }, { code: 'edsd' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [
      {
        code: 'leftpcuprecuneus'
      }
    ],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
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
    expect(wrapper.find('div#tabs-methods')).toHaveLength(1);
    expect(wrapper.find('.greyGridTable')).toHaveLength(1);
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .first()
        .text()
    ).toEqual('intercept');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(1)
        .text()
    ).toEqual('1.119');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(4)
        .text()
    ).toEqual('0.000 (***)');
  });
});
