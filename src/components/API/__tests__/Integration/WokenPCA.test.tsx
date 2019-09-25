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
const experimentCode = 'pca';
const model: any = (datasets: VariableEntity[]) => ({
  query: {
    pathology: 'dementia', // FIXME: should by dynamic
    coVariables: [
      {
        code: 'leftthalamusproper'
      },
      {
        code: 'leftacgganteriorcingulategyrus'
      },
      {
        code: 'leftententorhinalarea'
      },
      {
        code: 'leftmcggmiddlecingulategyrus'
      },
      {
        code: 'leftphgparahippocampalgyrus'
      },
      {
        code: 'leftpcggposteriorcingulategyrus'
      },
      {
        code: 'righthippocampus'
      },
      {
        code: 'rightthalamusproper'
      },
      {
        code: 'rightacgganteriorcingulategyrus'
      },
      {
        code: 'rightententorhinalarea'
      },
      {
        code: 'rightmcggmiddlecingulategyrus'
      },
      {
        code: 'rightphgparahippocampalgyrus'
      },
      {
        code: 'rightpcggposteriorcingulategyrus'
      }
    ],
    filters:
      '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"},{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"not_equal","value":"Other"}],"valid":true}',
    groupings: [],
    testingDatasets: [],
    trainingDatasets: datasets
      .slice(0, datasets.length - 1)
      .map(d => ({ code: d.code })),
    validationDatasets: datasets
      .slice(datasets.length - 1)
      .map(d => ({ code: d.code })),
    variables: [
      {
        code: 'lefthippocampus'
      }
    ]
  }
});

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

  // Test

  it(`create ${experimentCode}`, async () => {
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
    expect(wrapper.find('.loader')).toHaveLength(0);

    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });
});
