import APIMining from "../../Mining";
import APIModel from "../../Model";
import config from "../../RequestHeaders";

describe("Test Mining API", () => {
  const apiMining = new APIMining(config);
  let model;

  beforeAll(async () => {
    const apiModel = new APIModel(config);
    await apiModel.one("model");
    model = apiModel.state.model;
    const error = apiModel.state.error;
    expect(error).toBeFalsy();
    expect(model).toBeTruthy();

    return model;
  });

  it("create mining", async () => {
    const query = model.query;
    const payload = {
      covariables: query.coVariables ? query.coVariables : [],
      datasets: query.trainingDatasets,
      filters: query.filters,
      grouping: query.groupings ? query.groupings : [],
      variables: query.variables ? query.variables : []
    };
    await apiMining.allParallel({ payload });
    const result = apiMining.state.minings;
    console.log(result);
    const error = apiMining.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
