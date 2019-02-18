import * as React from "react";
import renderer from "react-test-renderer";
import { mount } from "enzyme";
import APICore from "../../Core";
import config from "../../RequestHeaders";

describe("Test Core API", () => {
  const apiCore = new APICore(config);

  it("get variables", async () => {
    await apiCore.variables();
    const result = apiCore.state.variables;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it("get datasets", async () => {
    await apiCore.datasets();
    const result = apiCore.state.datasets;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it("get methods", async () => {
    await apiCore.methods();
    const result = apiCore.state.methods;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
