// tslint:disable:no-console

import ExperimentListContainer from "../containers/Experiments/ExperimentListContainer";
import ModelContainer from "../containers/Models/ModelContainer";
import { methods, models } from "../tests/mocks";

/// TESTS ///

/*
    Expected results:
      type: regression, classification
      format: application/highcharts+json, image/svg+xml, application/vnd.plotly.v1+json, application/vnd.dataresource+json, application/vnd.visjs+javascript,
    text/plain, text/html, text/plain+error

*/

const highcharts = data => {
  data.forEach(d => {
    expect(d.xAxis).toBeDefined();
  });
};

const plotly = data => {
  data.forEach(d => {
    if (d.type && d.type === "heatmap") {
      expect(d.x).toBeDefined();
    } else {
      expect(d.data).toBeDefined();
    }
  });
};

const pfa = (data, hasValidation) => {
  console.log("has validation", hasValidation);
  data.forEach(d => {
    if (!d.cells) {
      expect(d).toBeDefined();
    } else {
      expect(d.cells).toBeDefined();

      if (hasValidation) {
        expect(d.cells.validations.init).toBeDefined();

        // Convert to array to have consistent results
        const init = d.cells.validations.init.length
          ? d.cells.validations.init
          : [d.cells.validations.init];

        init.forEach(i => {
          expect(i.code).toBeDefined();
          expect(i.node).toBeDefined();

          if (i.error) {
            expect(i.error).toBeDefined();
            console.log("\thas error");
            return;
          } else {
            expect(i.data).toBeDefined();
          }
        });
      }
    }
  });
};

const jsonTest = data => {
  data.forEach(d => {
    expect(d).toBeDefined();
  });
};

const errorTest = (data, error) => {
  if (data) {
    expect(data.error).toBeDefined();
  } else {
    expect(error).toBeDefined();
  }
  console.log("\thas error");
};

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

  experiments.forEach((experiment, index) => {
    console.log(index, "Experiment:", experiment.name, experiment.uuid);

    expect(experiment.created).toBeDefined();
    expect(experiment.hasError).toBeFalsy();

    if (experiment.hasServerError) {
      console.log("hasServerError");
      expect(experiment.result).toBeDefined();
      return;
    }

    if (!experiment.result) {
      expect(experiment.finished).toBeNull();
      console.log("no result");
      return;
    }

    expect(experiment.finished).toBeDefined();
    const algo = parse(experiment.algorithms);
    const names = algo.map(a => a.name);
    expect(names).toBeDefined();
    const codes = algo.map(a => a.code);
    expect(codes).toBeDefined();

    if (
      codes.includes("PIPELINE_ISOUP_MODEL_TREE_SERIALIZER") ||
      codes.includes("WP_LINEAR_REGRESSION")
    ) {
      console.log("\tExareme format, not parsing yet");
      return;
    }

    const result = parse(experiment.result);
    const hasValidation =
      Array.isArray(experiment.validations) &&
      experiment.validations.length > 0;

    result.forEach((r, i) => {
      const mime = r.type;
      console.log("\tname: ", names[i], ", mime:", mime);
      expect(mime).toBeDefined();

      // Convert to array to have consistent results
      const normalizedResult = input =>
        (input.data && (input.data.length ? input.data : [input.data])) || null;

      const results = normalizedResult(r);
      switch (mime) {
        case "application/vnd.highcharts+json":
          highcharts(results);
          break;

        case "application/vnd.plotly.v1+json":
          plotly(results);
          break;

        case "application/pfa+json":
          pfa(results, hasValidation);
          break;

        case "application/vnd.hbp.mip.experiment.pfa+json":
          results.forEach(aResult => {
            let subResult = aResult;

            // Lift the data one level up if needed
            if (aResult.data) {
              subResult = normalizedResult(aResult);
            }

            switch (subResult.type) {
              case "application/json":
                jsonTest(subResult);
                break;

              case "text/plain+error":
                errorTest(subResult);
                break;

              case "application/vnd.plotly.v1+json":
                console.log("application/vnd.plotly.v1+json");
                break;

              case "application/pfa+json":
                pfa(subResult, hasValidation);
                break;
            }
          });

        case "application/json":
          jsonTest(results);
          break;

        // case "application/vnd.dataresource+json":
        //   break;

        // case "application/vnd.visjs+javascript":
        // break;

        case "text/plain+error":
          console.log(results);
          errorTest(results, r);
          break;

        default:
          console.log("!!!!!!!! SHOULD TEST", mime);
      }
    });
  });
});
