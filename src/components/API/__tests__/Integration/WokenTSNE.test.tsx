import { mount } from 'enzyme';
import * as React from 'react';

import Result from '../../../Result/Result';
import { VariableEntity } from '../../Core';
import { ExperimentPayload } from '../../Experiment';
import {
  createExperiment,
  createModel,
  getDatasets,
  waitForResult
} from '../../Utils';

// config

const modelSlug = `model-${Math.round(Math.random() * 10000)}`;
const experimentCode = 'tSNE';
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    pathology: 'dementia', // FIXME: should by dynamic
    // coVariables: [{ code: 'lefthippocampus' }],
    groupings: [],
    testingDatasets: [],
    // filters:
    //   '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
    // // trainingDatasets: datasets.map(d => ({ code: d.code })),
    // validationDatasets: [],
    variables: [{ code: 'gender' }],
    coVariables: [
      { code: 'righthippocampus' },
      { code: 'rightententorhinalarea' },
      { code: 'lefthippocampus' },
      { code: 'leftthalamusproper' },
      { code: 'leftacgganteriorcingulategyrus' },
      { code: 'leftententorhinalarea' },
      { code: 'leftmcggmiddlecingulategyrus' },
      { code: 'leftphgparahippocampalgyrus' },
      { code: 'leftpcggposteriorcingulategyrus' },
      { code: 'rightthalamusproper' },
      { code: 'rightacgganteriorcingulategyrus' },
      { code: 'rightmcggmiddlecingulategyrus' },
      { code: 'rightphgparahippocampalgyrus' },
      { code: 'rightpcggposteriorcingulategyrus' }
    ],
    grouping: [],
    trainingDatasets: datasets,
    validationDatasets: [],
    filters:
      '{"condition":"AND","rules":[{"id":"agegroup","field":"agegroup","type":"string","input":"select","operator":"not_equal","value":"-50y"}],"valid":true}'
  }
});

const payload: ExperimentPayload = {
  algorithms: [
    {
      code: experimentCode,
      name: experimentCode,
      parameters: [],
      validation: false
    }
  ],
  model: modelSlug,
  name: `${experimentCode}-${modelSlug}`,
  validations: []
};

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
  });
});
