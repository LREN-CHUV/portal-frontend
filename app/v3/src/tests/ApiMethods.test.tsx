// tslint:disable:no-console

import ExperimentContainer from "@app/containers/Experiments/ExperimentContainer";
import ModelContainer from "@app/containers/Models/ModelContainer";
import { methods, models } from "@app/tests/mocks";
import { IExperimentResult, IModelResult } from "@app/types";

const datasets = ["desd-synthdata"];
const experimentsUUID: string[] = [];

/// TESTS ///
test("Create new models", async () => {
  console.log("> Create new models");
  const modelContainer = new ModelContainer();
  await Promise.all(
    Object.keys(models).map(async key => {
      await modelContainer.load(key);
      let result: IModelResult | undefined = modelContainer.state.model;
      if (result === undefined) {
        await modelContainer.create({
          config: {
            hasXAxis: true,
            height: 480,
            title: {
              text: key
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
        result = modelContainer.state.model;
        console.log("created: ", key);
      } else {
        console.log("existing: ", key);
      }

      expect(result).toBeDefined();
      expect(result!.slug).toBe(key);
    })
  );
  console.log("> Create new models done!");
});

test(`Set experiments`, async () => {
  console.log("> Set experiments");
  await Promise.all(
    methods.filter(m => m.modelStatus === "ok").map(async method => {
      const experimentContainer = new ExperimentContainer();
      const model = Object.keys(models).find(
        key => models[key] === method.model
      );
      const algorithm = {
        algorithms: [
          {
            code: method.code,
            name: method.code,
            parameters: method.parameters,
            validation: method.validations.length ? true : false
          }
        ],
        datasets,
        model,
        name: method.code,
        validations: method.validations
      };
      // console.log(algorithm)
      await experimentContainer.create(algorithm);
      console.log("created", algorithm.name);
      const result: IExperimentResult | undefined =
        experimentContainer.state.experiment;

      expect(result).toBeDefined();
      expect(result!.name).toBe(method.code);
      // expect(result!.model).toBeDefined();

      experimentsUUID.push(result!.uuid);
    })
  );
  console.log(experimentsUUID);
  console.log("> Set experiments done");
});

test("Fetch experiments", async done => {
  console.log("> Fetch experiments");
  const experimentContainer = new ExperimentContainer();
  const timeout = 3 * 60 * 1000;
  jest.setTimeout(4 * 60 * 1000);
  await setTimeout(async () => {
    await Promise.all(
      experimentsUUID.map(async uuid => {
        await experimentContainer.load(uuid);
        const result: IExperimentResult | undefined =
          experimentContainer.state.experiment;
        console.log("name: ", result!.name);
        expect(result).toBeDefined();

        const results = result!.result;
        expect(results).toBeDefined();
        results!.forEach(r => {
          expect(r.data).toBeDefined();
        });
      })
    );
    done();
    console.log("> Fetch experiments done");
  }, timeout);
});
