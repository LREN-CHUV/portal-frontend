import {
  APICore,
  APIExperiment,
  APIMining,
  APIModel
} from "@app/components/API";
import config from "@app/components/API/RequestHeaders";
import App from "@app/components/App/App";
import AppContainer from "@app/components/App/Container";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

jest.mock("request-promise-native");

describe("Test App component", () => {
  const apiExperiment = new APIExperiment(config);
  const apiModel = new APIModel(config);
  const apiCore = new APICore(config);
  const apiMining = new APIMining(config);
  const props = {
    appConfig: { appConfig: "MIP" },
    apiExperiment,
    apiCore,
    apiModel,
    apiMining
  };

  it("AppContainer dom renders correctly", () => {
    const wrapper = shallow(<AppContainer />);
    expect(wrapper).toBeDefined();
  });

  it("AppContainer snapshot renders correctly", () => {
    const tree = renderer.create(<AppContainer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("App dom renders correctly", () => {
    const wrapper = shallow(
        <App {...props} />
    );
    expect(wrapper).toBeDefined();
  });

  it("App snapshot renders correctly", () => {
    const tree = renderer
      .create(
        <Router>
          <App {...props} />
        </Router>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
