import { mount, shallow } from 'enzyme';
import * as React from 'react';
import Result from '../../../Result/Result';
import { AlgorithmParameter, VariableEntity } from '../../Core';
import { ExperimentPayload, Engine } from '../../Experiment';
import {
  createWorkflowPayload,
  createExperiment,
  createModel,
  getDatasets,
  waitForResult
} from '../../Utils';

import { buildWorkflowAlgorithmResponse } from '../../WorkflowAPIAdapter'

// config

const modelSlug = `workflow-nb-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'f2db41e1fa331b3e';
const parameters: AlgorithmParameter[] = [{ code: 'pathology', value: 'dementia' }];

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    pathology: 'dementia', // FIXME: should by dynamic
    coVariables: [{ code: 'lefthippocampus' }, { code: 'righthippocampus' }],
    filters: '',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [{ code: 'alzheimerbroadcategory' }]
  }
});

// Test

describe.skip('Integration Test for experiment API', () => {
  let datasets: VariableEntity[] | undefined;

  beforeAll(async () => {
    datasets = await getDatasets();
    expect(datasets).toBeTruthy();

    const mstate = await createModel({
      model: model(datasets),
      modelSlug
    });

    expect(mstate.error).toBeFalsy();
    expect(mstate.model).toBeTruthy();

    return datasets !== undefined && mstate.model !== undefined;
  });

  it(`create ${experimentCode}`, async () => {
    if (!datasets) {
      throw new Error('datasets not defined');
    }
    const payload: ExperimentPayload = await createWorkflowPayload(
      model,
      datasets,
      experimentCode,
      parameters,
      modelSlug
    );

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

    console.log(experimentState)
    // const props = { experimentState };

    // let wrapper: any = shallow(<Result {...props} />);
    // expect(wrapper.find('.error')).toHaveLength(0);
    // expect(wrapper.find('.loading')).toHaveLength(0);
    // // expect(wrapper.find('.result')).toHaveLength(2);

    // // Ensure Highchart is loading by catching error
    // // Annoying highcharts Type error due to embbedding visualisation in algorithms output
    // // FIXME: Exareme output as data

    // expect(() => {
    //   wrapper = mount(<Result {...props} />);
    // }).toThrow(TypeError);
  });
});
