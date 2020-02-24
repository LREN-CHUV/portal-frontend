import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Result from '../../../Result/Result';
import { VariableEntity } from '../../Core';
import { ExperimentPayload } from '../../Experiment';
import {
  createExaremePayload,
  createExperiment,
  createModel,
  getDatasets,
  waitForResult
} from '../../Utils';

// config

const modelSlug = `pearson-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'PEARSON_CORRELATION';
const parameters = [
  { name: 'bins', value: '40' },
  { name: 'iterations_max_number', value: 20 },
  { name: 'sstype', value: 2 },
  { name: 'outputformat', value: 'pfa' },
  { name: 'pathology', value: 'dementia' }
];

const model: any = (datasets: VariableEntity[]) => ({
  query: {
    // FIXME: should by dynamic
    coVariables: [
      {
        code: 'lefthippocampus'
      }
    ],
    filters: '',
    groupings: [],
    pathology: 'dementia',
    testingDatasets: [],
    trainingDatasets: datasets.map(d => ({
      code: d.code
    })),
    validationDatasets: [],
    variables: [
      {
        code: 'righthippocampus'
      }
    ]
  }
});

// Test

describe('Integration Test for experiment API', () => {
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
    const payload: ExperimentPayload = createExaremePayload(
      model,
      datasets,
      experimentCode,
      parameters,
      modelSlug,
      'python_local_global'
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

    const experimentState = await waitForResult({
      uuid
    });
    expect(experimentState.error).toBeFalsy();
    expect(experimentState.experiment).toBeTruthy();

    const props = {
      experimentState
    };

    let wrapper: any = shallow(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    // expect(wrapper.find('.result')).toHaveLength(2);

    // Ensure Highchart is loading by catching error
    // Annoying highcharts Type error due to embbedding visualisation in algorithms output
    // FIXME: Exareme output as data

    expect(() => {
      wrapper = mount(<Result {...props} />);
    }).toThrow(TypeError);
  });
});
