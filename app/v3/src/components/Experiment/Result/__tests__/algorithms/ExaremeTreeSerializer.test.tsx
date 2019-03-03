import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../../API/APIAdapter';
import { MIP } from '../../../../../types';

const parseExperiment = (json: any): MIP.API.IExperimentResponse =>
  APIAdapter.parse(json);

describe('Test Tree Serializer results', () => {
  it('Exareme Tree Serializer algorithm renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-exareme-tree-serializer.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    // We test if the script was evaluated, which should throw an error
    // in this test context. Should be fixed in exareme response API
    expect(() => mount(<Result {...props} />)).toThrow(TypeError);
  });
});
