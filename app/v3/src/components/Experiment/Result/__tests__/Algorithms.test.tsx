import Result from "../Result";
import * as React from "react";
import renderer from "react-test-renderer";
import { mount } from "enzyme";
import APIAdapter from "../../../API/APIAdapter";
import { MIP } from "@app/types";

const stringify = (json: any): void => {
  console.log(JSON.stringify(json, null, 2))
}

const parseExperiment = (json: any) : MIP.API.IExperimentResponse => APIAdapter.parse(json)

describe("Test Experiment results", () => {
  let props;

  beforeEach(() => {
    props = {
      experimentState: {}
    };
  });

  it("Federated linearRegression algorithm renders correctly", () => {
    const response = require("../__mocks__/responses/fed-linearRegression.json");
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);

    expect(wrapper.find(".error")).toHaveLength(0);
    expect(wrapper.find(".loading")).toHaveLength(0);
    expect(wrapper.find("div#tabs-methods")).toHaveLength(1);
  });

});
