import { mount } from 'enzyme';
import * as React from 'react';

import { MIP } from '../../../../../../types';
import Result from '../../../../../Experiment/Result/Result';
import {
    createExperiment, createModel, datasets, uid, waitForResult
} from '../../../../../utils/TestUtils';
import { VariableEntity } from '../../../../Core';

// Review May 2018 experiment

// config

const modelSlug = `model-${uid()}`;
const experimentCode = 'anova';
const parameters = [{ code: 'design', value: 'additive' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    variables: [{ code: 'montrealcognitiveassessment' }],
    coVariables: [],
    groupings: [{ code: 'alzheimerbroadcategory' }, { code: 'gender' }],
    trainingDatasets: datasets
      .filter(d => d.code !== 'ppmi' && d.code !== 'edsd')
      .map(d => ({
        code: d.code
      })),
    filters:
      '{"condition":"AND","rules":[{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"not_equal","value":"Other"}],"valid":true}',
    testingDatasets: [],
    validationDatasets: []
  }
});

const payload: MIP.API.IExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode,
      parameters,
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
    expect(wrapper.find('div#tabs-methods')).toHaveLength(1);
    expect(wrapper.find('.greyGridTable')).toHaveLength(1);
    // expect(
    //   wrapper
    //     .find('.greyGridTable tbody tr td')
    //     .at(4)
    //     .text()
    // ).toEqual('0.000 (***)');
  });
});
