import ExperimentContainer from "../containers/Experiments/ExperimentContainer";
import ModelContainer from "../containers/Models/ModelContainer";
import { IExperimentResult, IModelResult } from "../types";

const datasets = ["desd-synthdata"];

let modelTitle: string;
let experimentUUID: string;

/// TESTS ///

beforeAll(() => {
  modelTitle = `${Date.now()}`;
});

test("initial state is: loading", () => {
  const experimentContainer = new ExperimentContainer();
  expect(experimentContainer.state.loading).toBe(true);
});

test.skip("Create new model", async () => {
  const modelContainer = new ModelContainer();
  await modelContainer.create({
    config: {
      title: {
        text: modelTitle
      }
    },
    dataset: {
      code: "DS1528208604241"
    },
    query: {
      coVariables: [{ code: "lefthippocampus" }],
      filters: "",
      groupings: [],
      testingDatasets: [],
      trainingDatasets: ["desd-synthdata"],
      validationDatasets: [],
      variables: [{ code: "leftpoparietaloperculum" }]
    }
  });
  const result: IModelResult | undefined = modelContainer.state.model;

  expect(result).toBeDefined();
  expect(result!.slug).toBe(modelTitle);
});

test.skip("Load model", async () => {
  const modelContainer = new ModelContainer();
  await modelContainer.load(modelTitle);

  const result: IModelResult | undefined = modelContainer.state.model;

  expect(result).toBeDefined();
  expect(result!.slug).toBe(modelTitle);
});

test.skip("Set experiment", async () => {
  const experimentContainer = new ExperimentContainer();
  const code = "tSNE";
  const algorithm = {
    algorithms: [
      {
        code,
        name: code,
        parameters: [],
        validation: true
      }
    ],
    datasets,
    model: modelTitle,
    name: code,
    validations: []
  };
  await experimentContainer.create(algorithm);
  const result: IExperimentResult | undefined =
    experimentContainer.state.experiment;

  expect(result).toBeDefined();
  expect(result!.name).toBe("tSNE");

  experimentUUID = result!.uuid;
});

test.skip("Fetch experiment", async done => {
  const experimentContainer = new ExperimentContainer();

  jest.setTimeout(4 * 60 * 1000);
  await setTimeout(async () => {
    await experimentContainer.load(experimentUUID);
    const eresult: IExperimentResult | undefined =
      experimentContainer.state.experiment;

    expect(eresult).toBeDefined();
    expect(eresult!.name).toBe("tSNE");

    const results = eresult!.result;
    expect(results).toBeDefined();
    results!.forEach(result => {
      expect(result.data).toBeDefined();
    });

    done();
  }, 60 * 1000);
});
