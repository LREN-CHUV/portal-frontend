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
      heatmaps: APIMining.normalizeHeatmapData(heatmap)
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('.heatmap h3').text()).toEqual('');
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });

  it('Federated heatmap 1', () => {
    const data = require('../__mocks__/responses/fed-heatmap.json');
    const heatmap = {
      data: data && data.data,
      dataset: { code: 'dataset.code' },
      error: undefined
    };
    const props = {
      heatmaps: APIMining.normalizeHeatmapData(heatmap)
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });

  it('Federated heatmap 2', () => {
    const data = require('../__mocks__/responses/fed-heatmap2.json');
    const heatmap = {
      data: data && data.data,
      dataset: { code: 'dataset.code' },
      error: undefined
    };
    const props = {
      heatmaps: APIMining.normalizeHeatmapData(heatmap)
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });
});
