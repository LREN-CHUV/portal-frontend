import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../Result/Result';
import {
  createExperiment,
  createModel,
  waitForResult,
  workflows
} from '../../../../utils/TestUtils';
import { Algorithm, VariableEntity } from '../../../Core';
import { ExperimentPayload } from '../../../Experiment';
import {
  buildWorkflowAlgorithmRequest,
  buildWorkflowAlgorithmResponse
} from '../../../WorkflowAPIAdapter';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
let algorithm: Algorithm | undefined;

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
    const algorithmList = await workflows(false);
    algorithm = algorithmList && algorithmList.pop();

    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });
    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return true;
  });

  it(`create ${algorithm && algorithm.name}`, async () => {
    if (algorithm) {
      const requestParameters = buildWorkflowAlgorithmRequest(
        model(datasets),
        algorithm,
        algorithm.parameters
      );

      const payload: ExperimentPayload = {
        algorithms: [
          {
            code: algorithm.code,
            name: algorithm.code,
            parameters: requestParameters,
            validation: false
          }
        ],
        model: modelSlug,
        name: `${algorithm.code}-${modelSlug}`,
        validations: [],
        source: 'workflow'
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
      console.log(experimentState);
      // const response = buildWorkflowAlgorithmResponse(experimentState.experiment)
      //   expect(experimentState.experiment).toBeTruthy();

      //   console.log(experimentState.experiment);
    }

    // const uuid = experiment && experiment.uuid;
    // expect(uuid).toBeTruthy();
    // if (!uuid) {
    //   throw new Error('uuid not defined');
    // }

    // const experimentState = await waitForResult({
    //   uuid
    // });
    // expect(experimentState.error).toBeFalsy();
    // expect(experimentState.experiment).toBeTruthy();

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
