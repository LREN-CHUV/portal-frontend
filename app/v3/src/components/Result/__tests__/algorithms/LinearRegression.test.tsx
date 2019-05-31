import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../API/APIAdapter';

const parseExperiment = (json: any): ExperimentResponse =>
  APIAdapter.parse(json);

describe('Test linearRegression results', () => {
  it('Federated linearRegression algorithm with several datasets renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-linearRegression-datasets.json');
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
    ).toEqual('intercept');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(1)
        .text()
    ).toEqual('2.300');
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

  it('Federated linearRegression algorithm with one dataset renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-linearRegression-1dataset.json');
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
    ).toEqual('intercept');
    expect(
      wrapper
        .find('.greyGridTable tbody tr td')
        .at(1)
        .text()
    ).toEqual('2.300');
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
