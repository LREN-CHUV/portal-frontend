import * as React from "react";
import renderer from "react-test-renderer";
import { mount } from "enzyme";
import { MIP } from "../../../types";
import APIModel from "../Model";
import config from "../RequestHeaders";

describe("Test API", () => {
  const apiModel = new APIModel(config);
  const model = {
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
  let slug;

  it("create model", async () => {
    await apiModel.save({ model, title: "model" });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    slug = result && result.slug;
    expect(error).toBeFalsy()
    expect(result).toBeTruthy()
  });

  it("update model", async () => {
    expect(slug).toBeTruthy()
    const updatedModel = { ...model, slug }
    await apiModel.update({ model: updatedModel });
    const result = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy()
    expect(result).toBeTruthy()
    expect(result.slug).toEqual(slug)
  });
});
