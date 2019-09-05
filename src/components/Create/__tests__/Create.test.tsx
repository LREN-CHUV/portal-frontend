import { APICore, APIExperiment, APIModel } from "../../API";
import config from "../../API/RequestHeaders";
import ExperimentCreate from "../Container";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { shallow } from "enzyme";
// import renderer from "react-test-renderer";

describe("Test Create component", () => {
  const apiExperiment = new APIExperiment(config);
  const apiModel = new APIModel(config);
  const apiCore = new APICore(config);
  const props = {
    apiExperiment,
    apiCore,
    apiModel
  };

  const component = (
    <Router>
      <ExperimentCreate {...props} />
    </Router>
  );

  it("Create dom renders correctly", () => {
    const wrapper = shallow(component);
    expect(wrapper).toBeDefined();
  });

  // TODO: async testing
  // https://github.com/airbnb/enzyme/issues/346
  // it("Create snapshot renders correctly", () => {
  //   const tree = renderer.create(component).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
