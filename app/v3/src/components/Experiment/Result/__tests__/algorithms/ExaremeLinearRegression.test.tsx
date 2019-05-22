import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../../API/APIAdapter';

const parseExperiment = (json: any): MIP.API.IExperimentResponse =>
  APIAdapter.parse(json);

describe('Test linearRegression results', () => {
  it('Exareme linearRegression algorithm renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-exareme-linearRegression.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .first()
        .text()
    ).toEqual('(Intercept)');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(1)
        .text()
    ).toEqual('1.711');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(4)
        .text()
    ).toEqual('0.000 (***)');
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div#tabs-methods')).toHaveLength(1);
  });
});
