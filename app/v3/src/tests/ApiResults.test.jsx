// tslint:disable:no-console

import ExperimentListContainer from "../containers/Experiments/ExperimentListContainer";
import ModelContainer from "../containers/Models/ModelContainer";
import { methods, models } from "../tests/mocks";
// import { IExperimentResult, IModelResult } from "../types";

const datasets = ["desd-synthdata"];

/// TESTS ///

/*
    Expected results:
      type: regression, classification
      format: application/highcharts+json, image/svg+xml, application/vnd.plotly.v1+json, application/vnd.dataresource+json, application/vnd.visjs+javascript,
    text/plain, text/html, text/plain+error

*/

const parse = value => {
  try {
    const json = JSON.parse(value);
    return json;
  } catch (e) {
    console.log("ERROR while parsing", e);
  }
};

test("Fetch experiments", async () => {
  const experimentListContainer = new ExperimentListContainer();

  await experimentListContainer.load();
  const experiments: IExperimentResult | undefined =
    experimentListContainer.state.experiments;
  expect(experiments).toBeDefined();

  let succeeded = 0;
  experiments.forEach(experiment => {
    console.log("Experiment:", experiment.name, experiment.uuid);

    expect(experiment.created).toBeDefined();
    expect(experiment.hasError).toBeFalsy();

    if (experiment.hasServerError) {
      expect(experiment.result).toBeDefined();
      return;
    }

    if (!experiment.result) {
      expect(experiment.finished).toBeNull();
      return;
    }

    const result = parse(experiment.result);

    expect(experiment.finished).toBeDefined();
    const algo = parse(experiment.algorithms);
    const names = algo.map(a => a.code);
    expect(names).toBeDefined();

    succeeded++;

    result.forEach((r, i) => {
      const mime = r.type;
      console.log("\tname: ", names[i], ", mime:", mime);
      expect(mime).toBeDefined();

      const data = r.data && (r.data.length ? r.data : [r.data]) || null;

      switch (mime) {
        case "application/vnd.highcharts+json":
          data.forEach(d => {
            expect(d.xAxis).toBeDefined();
          });
          break;
        case "application/vnd.plotly.v1+json":
          data.forEach(d => {
            if (d.type && d.type === "heatmap") {
              expect(d).toBeDefined();
            } else {
              expect(d.data).toBeDefined();
            }
          });
          break;
        case "application/pfa+json":
          data.forEach(d => {
            expect(d.cells).toBeDefined();
          });
          break;
        case "application/json":
          data.forEach(d => {
            expect(d).toBeDefined();
          });
          break;
        case "text/plain+error":
          expect(r.error).toBeDefined();
          break;
        default:
          console.log("SHOULD TEST", mime);
      }
    });
  });
  console.log("Parsed", succeeded, "results on a total of", experiments.length);
});
