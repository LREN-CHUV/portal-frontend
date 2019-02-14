import Result from "../Result";
import * as React from "react";
import renderer from "react-test-renderer";
import { mount } from "enzyme";
import APIAdapter from "../../../API/APIAdapter";
import { MIP } from "@app/types";

const stringify = (json: any): void => {
  console.log(JSON.stringify(json, null, 2));
};

const parseExperiment = (json: any): MIP.API.IExperimentResponse =>
  APIAdapter.parse(json);

describe("Test Experiment results", () => {
  it("Federated linearRegression algorithm renders correctly", () => {
    const response = require("../__mocks__/responses/fed-linearRegression.json");
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);
    expect(
      wrapper
        .find(".greyGridTable tbody tr td")
        .first()
        .text()
    ).toEqual("rightphgparahippocampalgyrus");
    expect(
      wrapper
        .find(".greyGridTable tbody tr td")
        .at(1)
        .text()
    ).toEqual("5.227");
    expect(wrapper.find(".error")).toHaveLength(0);
    expect(wrapper.find(".loading")).toHaveLength(0);
    expect(wrapper.find("div#tabs-methods")).toHaveLength(1);
  });

  it("Federated naiveBayes algorithm renders correctly", () => {
    const response = require("../__mocks__/responses/fed-naivebayes.json");
    const experiment = parseExperiment(response);
    const props = {
      experimentState: {
        experiment
      }
    };
    const wrapper = mount(<Result {...props} />);

    expect(wrapper.find(".error")).toHaveLength(0);
    expect(wrapper.find(".loading")).toHaveLength(0);
    expect(wrapper.find("div#tabs-node")).toHaveLength(1);
    expect(wrapper.find("a#tabs-node-tab-0")).toHaveLength(1);
    expect(wrapper.find("a#tabs-node-tab-1")).toHaveLength(1);
    const table = wrapper.find("ul.pfa-table");
    expect(table).toHaveLength(4);
    expect(
      table
        .find("li")
        .first()
        .equals(
          <li>
            <strong>Accuracy</strong>: 0.457
          </li>
        )
    ).toEqual(true);
    expect(wrapper.find(".greyGridTable")).toHaveLength(4);
  });
});
