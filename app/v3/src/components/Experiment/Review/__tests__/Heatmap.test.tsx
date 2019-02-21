import { APICore, APIMining } from '../../../API';
import config from '../../../API/RequestHeaders';
import HeatMap from '../HeatMap';
import * as React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { shallow } from 'enzyme';

describe('Test Heatmap component', () => {
  const apiMining = new APIMining(config);
  let datasets;
  let model;

  beforeAll(async () => {
    const apiCore = new APICore(config);
    await apiCore.datasets();
    datasets = apiCore.state.datasets;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(datasets).toBeTruthy();
    model = {
      query: {
        coVariables: [{ code: 'alzheimerbroadcategory' }],
        groupings: [],
        testingDatasets: [],
        filters:
          '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
        trainingDatasets: datasets.map(d => ({ code: d.code })),
        validationDatasets: [],
        variables: [{ code: 'lefthippocampus' }]
      }
    };

    return datasets;
  });

  it('Create dom renders correctly', () => {
    const props = { apiMining, model };
    const component = <HeatMap {...props} />;
    const wrapper = shallow(component);
    expect(wrapper).toBeDefined();
  });

  it('Local heatmap', () => {
    const data = require('../__mocks__/responses/local-heatmap.json');
    const heatmap = APIMining.normalizeHeatmapData(data)
    const props = {
      apiMining: {
        state: {
          heatmap
        }
      },
      model
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(1);
  });

  it('Federated heatmap', () => {
    const results = require('../__mocks__/responses/fed-heatmap.json');
    const heatmap = APIMining.normalizeHeatmapData(results)
    const props = {
      apiMining: {
        state: {
          heatmap
        }
      },
      model
    };

    const wrapper = mount(<HeatMap {...props} />);
    expect(wrapper.find('.loader .hidden')).toHaveLength(1);
    expect(wrapper.find('PlotlyComponent')).toHaveLength(3);
  });
});
