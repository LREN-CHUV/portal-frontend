import * as React from "react";
import renderer from "react-test-renderer";
import { mount } from "enzyme";
import APIModel from "../../Model";
import config from "../../RequestHeaders";

describe("Test Model API", () => {
  const apiModel = new APIModel(config);
  let model = {
    query: {
      coVariables: [{ code: "alzheimerbroadcategory" }],
      groupings: [],
      testingDatasets: [],
      filters:
        '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"65"}],"valid":true}',
      trainingDatasets: [{ code: "adni" }, { code: "edsd" }],
      validationDatasets: [],
      variables: [{ code: "lefthippocampus" }]
    }
  };

  it("create model", async () => {
    await apiModel.save({ model, title: "model" });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
    model = result;
  });

  it("update model", async () => {
    await apiModel.update({ model });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
