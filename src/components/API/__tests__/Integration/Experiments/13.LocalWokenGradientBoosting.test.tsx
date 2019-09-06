import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../../Result/Result';
import {
  createExperiment,
  createModel,
  datasets,
  waitForResult
} from '../../../../utils/TestUtils';
import { VariableEntity } from '../../../Core';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'gradientBoosting';
const parameters = [
  {
    code: 'learning_rate',
    value: '0.1'
  },
  {
    code: 'n_estimators',
    value: '100'
  },
  {
    code: 'max_depth',
    value: '3'
  },
  {
    code: 'min_samples_split',
    value: '2'
  },
  {
    code: 'min_samples_leaf',
    value: '1'
  },
  {
    code: 'min_weight_fraction_leaf',
    value: '0'
  },
  {
    code: 'min_impurity_decrease',
    value: '0'
  }
];
const kfold = {
  code: 'kfold',
  name: 'validation',
  parameters: [
    {
      code: 'k',
      value: '2'
    }
  ]
};
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    coVariables: [{ code: 'lefthippocampus' }],
    groupings: [],
    testingDatasets: [],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    trainingDatasets: datasets
      .slice(0, datasets.length - 1)
      .map(d => ({ code: d.code })),
    validationDatasets: datasets
      .slice(datasets.length - 1)
      .map(d => ({ code: d.code })),
    variables: [{ code: 'alzheimerbroadcategory' }]
  }
});

const payload: ExperimentPayload = {
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
  validations: [kfold]
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
    expect(wrapper.find('.pfa-table')).toHaveLength(1);
  });
});
