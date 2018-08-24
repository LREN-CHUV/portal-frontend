import ExperimentContainer from "../containers/Experiments/ExperimentContainer";
import ModelContainer from "../containers/Models/ModelContainer";
import { models } from "../tests/mocks";
import { IExperimentResult, IModelResult } from "../types";

let modelId: string;
let experimentUUID: string;

// TESTS /; //

beforeAll(() => {
  modelId = `${Date.now()}`;
});

test.only("initial state is: loading", () => {
  const experimentContainer = new ExperimentContainer();
  expect(experimentContainer.state.loading).toBe(true);
});

test("Create new model", async () => {
  const key = "regression0";
  const modelContainer = new ModelContainer();
  await modelContainer.create({
    config: {
      hasXAxis: true,
      height: 480,
      title: {
        text: modelId
      },
      type: "designmatrix",
      xAxisVariable: null,
      yAxisVariables: ["apoe4"]
    },
    dataset: {
      code: "DS1528208604241",
      date: 1533814206000,
      grouping: [],
      header: models[key].coVariables.map((v: any) => v.code),
      variable: models[key].variables.map((v: any) => v.code)
    },
    query: models[key]
  });
  const result: IModelResult | undefined = modelContainer.state.model;

  expect(result).toBeDefined();
  expect(result!.title).toBe(modelId);
});

test.skip("Load model", async () => {
  const modelContainer = new ModelContainer();
  await modelContainer.load(modelId);

  const result: IModelResult | undefined = modelContainer.state.model;

  expect(result).toBeDefined();
  expect(result!.slug).toBe(modelId);
});

test.skip("Set experiment", async () => {
  const experimentContainer = new ExperimentContainer();
  const code = "tSNE";
  const algorithm = {
    algorithms: [
      {
        code,
        name: `testing-${modelId}`,
        parameters: [],
        validation: true
      }
    ],
    model: modelId,
    name: `tSNE-${modelId}`,
    validations: []
  };
  await experimentContainer.create(algorithm);
  const result: IExperimentResult | undefined =
    experimentContainer.state.experiment;

  experimentUUID = result!.uuid;
  expect(result).toBeDefined();
  expect(result!.name).toBe(`tSNE-${modelId}`);
});

test.skip("Fetch experiment", async done => {
  const experimentContainer = new ExperimentContainer();

  jest.setTimeout(3 * 60 * 1000);
  await setTimeout(async () => {
    await experimentContainer.load(experimentUUID);
    const eresult: IExperimentResult | undefined =
      experimentContainer.state.experiment;

    expect(eresult).toBeDefined();
    expect(eresult!.name).toBe(`tSNE-${modelId}`);

    const results = eresult!.result;
    expect(results).toBeDefined();
    results!.forEach(result => {
      expect(result.data).toBeDefined();
    });

    done();
  }, 2 * 60 * 1000);
});
