import { APICore, APIMining } from '../../../API';
import config from '../../../API/RequestHeaders';
import HeatMap from '../HeatMap';
import * as React from 'react';
import { mount } from 'enzyme';
import { shallow } from 'enzyme';

describe('Test Heatmap component', () => {
  const apiMining = new APIMining(config);
  const model = {
      query: {
        coVariables: [{ code: 'alzheimerbroadcategory' }],
        groupings: [],
        testingDatasets: [],
        filters:
          '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
        trainingDatasets: { code: 'dataset.code' },
        validationDatasets: [],
        variables: [{ code: 'lefthippocampus' }]
      }
    };


  it('Create dom renders correctly', () => {
    const props = { apiMining, model };
    const component = <HeatMap {...props} />;
    const wrapper = shallow(component);
    expect(wrapper).toBeDefined();
  });

  it('Local heatmap', () => {
    const data = require('../__mocks__/responses/local-heatmap.json');
    const heatmap = {
      data: data && data.data,
      dataset: { code: 'dataset.code' },
      error: undefined
    };
    const props = {
      apiMining: {
        state: {
          heatmaps: APIMining.normalizeHeatmapData(heatmap)
        }
      },
      model
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('.heatmap h3').text()).toEqual('dataset.code');
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });

  it('Federated heatmap', () => {
    const data = require('../__mocks__/responses/fed-heatmap.json');
    const heatmap = {
      data: data && data.data,
      dataset: { code: 'dataset.code' },
      error: undefined
    };
    const props = {
      apiMining: {
        state: {
          heatmaps: APIMining.normalizeHeatmapData(heatmap)
        }
      },
      model
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('.heatmap h3').at(1).text()).toEqual('dataset.code');
    expect(wrapper.find('PlotlyComponent')).toHaveLength(3);
  });
});
