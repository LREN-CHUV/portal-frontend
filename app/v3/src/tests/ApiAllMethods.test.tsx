// tslint:disable:no-console

import config from "../config";
import ExperimentContainer from "../containers/api/ExperimentContainer";
import ModelContainer from "../containers/api/ModelContainer";
import { experiments, models } from "../tests/mocks";
import { IExperimentResult, IModelResult } from "../types";

const experimentsUUID: string[] = [];

/// TESTS ///
test("Create new models", async () => {
  console.log("> Create new models");
  const modelContainer = new ModelContainer(config);
  return await Promise.all(
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

test.skip(`Set experiments`, async () => {
  console.log("> Set experiments");

  const r = Math.floor(Math.random() * Math.floor(experiments.length));
  // const r = experiments.length;
  const experimentsToRun = experiments.slice(r, r + 2);

  console.log({ experimentsToRun });
  jest.useFakeTimers();
  jest.setTimeout(20000);

  return await Promise.all(
    experimentsToRun.map(
      (experiment, i) =>
        new Promise(resolve => {
          const run = () => {
            console.log("THEN");
            const experimentContainer = new ExperimentContainer(config);
            const model = Object.keys(models).find(
              key => models[key] === experiment.model
            );
            const exp = {
              algorithms: experiment.methods.map(m => ({
                code: m.code,
                name: m.code,
                parameters: m.parameters,
                validation: experiment.validations.length ? true : false
              })),
              model,
              name: experiment.name,
              validations: experiment.validations
            };
            experimentContainer.create(exp);

            const result: IExperimentResult | undefined =
              experimentContainer.state.experiment;

            expect(result).toBeDefined();
            expect(result!.name).toBe(experiment.name);
            // expect(result!.model).toBeDefined();
            console.log("created", exp.name);

            experimentsUUID.push(result!.uuid);

            resolve();
          };
          setTimeout(run, 3);
        })
    )
  );

  jest.runAllTimers();
  console.log(experimentsUUID);
  console.log("> Set experiments done");
});
