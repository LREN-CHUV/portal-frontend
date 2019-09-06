import config from '../../API/RequestHeaders';
import Container from '../Container';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import * as ReactDOM from 'react-dom';
import { APICore, APIExperiment, APIModel } from '../../API';
import { shallow } from 'enzyme';

jest.mock('request-promise-native');
describe('Test Result components', () => {
  const apiExperiment = new APIExperiment(config);
  const apiModel = new APIModel(config);
  const apiCore = new APICore(config);

  let props;
  let component;

  beforeEach(() => {
    props = {
      apiExperiment,
      apiCore,
      apiModel
    };
    component = (
      <Router>
        <Container {...props} />
      </Router>
    );
  });

  it('Result dom renders correctly', () => {
    const wrapper = shallow(component);
    expect(wrapper).toBeDefined();
  });

  it('Result snapshot renders correctly', () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
