import Result from '../../Result';
import * as React from 'react';
import { mount } from 'enzyme';
import APIAdapter from '../../../API/APIAdapter';
import { MIP } from '../../../../../types';

const parseExperiment = (json: any): ExperimentResponse =>
  APIAdapter.parse(json);

describe('Test naiveBayes results', () => {

  it('Federated naiveBayes algorithm renders correctly', () => {
    const response = require('../../__mocks__/responses/fed-naivebayes.json');
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);

    expect(wrapper.find('.error')).toHaveLength(0);
    expect(wrapper.find('.loading')).toHaveLength(0);
    expect(wrapper.find('div#tabs-node')).toHaveLength(1);
    expect(wrapper.find('a#tabs-node-tab-0')).toHaveLength(1);
    expect(wrapper.find('a#tabs-node-tab-1')).toHaveLength(1);
    const table = wrapper.find('ul.pfa-table');
    expect(table).toHaveLength(4);
    expect(
      table
        .find('li')
        .first()
        .equals(
          <li>
            <strong>Accuracy</strong>: 0.457
          </li>
        )
    ).toEqual(true);
    expect(wrapper.find('.greyGridTable')).toHaveLength(4);
  });
});
