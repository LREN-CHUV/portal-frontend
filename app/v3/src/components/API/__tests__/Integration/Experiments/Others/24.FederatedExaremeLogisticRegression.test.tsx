import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../../Result/Result';
import {
  createExperiment,
  createModel,
  waitForResult
} from '../../../../../utils/TestUtils';
import { VariableEntity } from '../../../../Core';
import { buildExaremeAlgorithmRequest } from '../../../../ExaremeAPIAdapter';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'LOGISTIC_REGRESSION';
const parameters: any = [];
const datasets = [{ code: 'adni' }];
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'lefthippocampus' }],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [
      {
        code: 'gender'
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
      source: 'exareme'
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

    /*
    FIXME: Highchart heatmap lib error
     at /home/manuel/workdir/portal-frontend/app/v3/node_modules/react-dom/cjs/react-dom.development.js:20418:5 TypeError: Cannot read property 'attr' of undefined
    at q.<anonymous> (/home/manuel/workdir/portal-frontend/app/v3/node_modules/highcharts/modules/heatmap.src.js:1557:25)


    */
    // const props = { experimentState };
    // const wrapper = mount(<Result {...props} />);
    // expect(() => mount(<Result {...props} />)).toThrow(TypeError);
    // expect(wrapper.find('.error')).toHaveLength(0);
    // expect(wrapper.find('.loading')).toHaveLength(0);
    // expect(wrapper.find('div#tabs-methods')).toHaveLength(1);
  });
});
