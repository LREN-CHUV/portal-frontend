import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../../API/APIAdapter';

const parseExperiment = (json: any): ExperimentResponse =>
  APIAdapter.parse(json);

describe('Test Exareme histograms results', () => {
  it('Exareme histograms error renders correctly', () => {
    const response = require('../../__mocks__/responses/exareme-histogram-error.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error p').text()).toEqual(
      'Dataset(s) ppmi not found!'
    );
  });

  it('Exareme histograms renders correctly', () => {
    const response = require('../../__mocks__/responses/exareme-histogram.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);
    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    // FIXME: find a way to test SVG output
    // expect(wrapper.find('.highcharts-root')).toHaveLength(1);
  });
});
