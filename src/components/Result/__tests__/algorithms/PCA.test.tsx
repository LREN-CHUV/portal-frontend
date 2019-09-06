import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../API/APIAdapter';

const parseExperiment = (json: any): ExperimentResponse =>
  APIAdapter.parse(json);

describe('Test naiveBayes results', () => {
  it('Federated PCA algorithm renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-pca.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);

    expect(wrapper.find('.loader')).toHaveLength(0);
    expect(wrapper.find('.loader')).toHaveLength(0);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });

  it('Federated PCA 2 algorithm renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-pca1.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);

    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loader')).toHaveLength(0);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });
});
