import Result from '../Result';
import * as React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const stringify = (json: any): void => {
  console.log(JSON.stringify(json, null, 2));
};

describe('Test Experiment results', () => {
  let props;

  beforeEach(() => {
    props = {
      experimentState: {}
    };
  });

  it('dom renders correctly', () => {
    const wrapper = shallow(<Result {...props} />);
    expect(wrapper).toBeDefined();
  });

  it('snapshot renders correctly', () => {
    const tree = renderer.create(<Result {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('loading renders correctly', () => {
    const wrapper = shallow(<Result {...props} />);
    const loading = wrapper.find('.loading');
    expect(loading).toHaveLength(1);
  });

  it('!loading renders correctly', () => {
    const props = {
      experimentState: {
        experiment: {
          results: []
        }
      }
    };
    const wrapper = shallow(<Result {...props} />);
    const loading = wrapper.find('.loading');
    expect(loading).toHaveLength(0);
  });

  it('error renders correctly', () => {
    const props = {
      experimentState: {
        error: 'ouch'
      }
    };
    const wrapper = shallow(<Result {...props} />);
    const error = wrapper.find('.error');
    expect(error).toHaveLength(1);
  });
});
