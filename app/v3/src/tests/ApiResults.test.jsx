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

  return data;
};

const plotly = data => {
  data.forEach(d => {
    if (d.type && d.type === "heatmap") {
      expect(d.x).toBeDefined();
    } else {
      expect(d.data).toBeDefined();
    }
  });

  return data
};

const pfa = (data, hasValidation) => {
  // console.log("has validation", hasValidation);
  const output = { data: [] };
  data.forEach(d => {
    if (!d.cells) {
      expect(d).toBeDefined();
      output.data.push(d);
    } else {
      expect(d.cells).toBeDefined();

      if (d.cells.validations) {
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
            output.error += i.error;
            // console.log("\thas error");
            return;
          } else {
            expect(i.data).toBeDefined();
            output.data.push({ code: i.code, data: i.data, node: i.node });
          }
        });
      }
    }
  });
  return output;
};

const jsonTest = data => {
  data.forEach(d => {
    expect(d).toBeDefined();
  });
  return data;
};

const errorTest = (data, error) => {
  let errorOutput;
  if (data) {
    expect(data.error).toBeDefined();
    errorOutput = data.error;
  } else {
    expect(error).toBeDefined();
    errorOutput = error;
  }

  return errorOutput.slice(-144);
  // console.log("\thas error");
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

  let experimentResults = [];
  experiments.slice(0, 100).forEach((experiment, index) => {
    // console.log(JSON.stringify(experiment, null, 2));

    expect(experiment.created).toBeDefined();
    expect(experiment.hasError).toBeFalsy();
    expect(experiment.name).toBeDefined();
    expect(experiment.uuid).toBeDefined();
    expect(experiment.resultsViewed).toBeDefined();

    let experimentResult = {
      created: new Date(experiment.created),
      error: undefined,
      loading: true,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      uuid: experiment.uuid
    };

    if (!experiment.model) {
      experimentResult.error = "No model defined";
      experimentResult.loading = false;
      experimentResults.push(experimentResult);

      return;
    }

    expect(experiment.model.slug).toBeDefined();
    console.log(
      index,
      "Experiment:",
      experiment.name,
      `${experiment.model.slug}/${experiment.uuid}`
    );

    experimentResult = {
      ...experimentResult,
      model: experiment.model.slug
    };

    if (experiment.hasServerError) {
      // console.log("hasServerError");
      expect(experiment.result).toBeDefined();

      experimentResult = {
        ...experimentResult,
        error: experiment.result,
        loading: false
      };
      experimentResults.push(experimentResult);

      return;
    }

    if (!experiment.result) {
      // console.log("No result");
      expect(experiment.finished).toBeNull();

      const created = new Date(experiment.created);
      const elapsed = (new Date() - new Date(experiment.created)) / 1000;

      if (elapsed > 60 * 5) {
        experimentResult = {
          ...experimentResult,
          error: "No result",
          loading: false
        };
      }
      experimentResults.push(experimentResult);
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
      // console.log("\tExareme format, not parsing yet");

      experimentResult = {
        ...experimentResult,
        error: "Exareme",
        loading: false
      };
      experimentResults.push(experimentResult);

      return;
    }

    const result = parse(experiment.result);
    const hasValidation =
      Array.isArray(experiment.validations) &&
      experiment.validations.length > 0;

    const nodes = [];
    result.forEach((r, i) => {
      let node = {};
      const mime = r.type;
      console.log("\tname: ", names[i], ", mime:", mime);
      expect(mime).toBeDefined();

      expect(r.node).toBeDefined();
      node = { name: r.node, algorithm: r.algorithm, mime };

      // Convert to array to have consistent results
      const normalizedResult = input =>
        (input.data && (input.data.length ? input.data : [input.data])) || null;

      const results = normalizedResult(r);
      switch (mime) {
        case "application/vnd.highcharts+json":
          node.data = highcharts(results);
          break;

        case "application/vnd.plotly.v1+json":
          node.data = plotly(results);
          break;

        case "application/pfa+json":
          const output = pfa(results, hasValidation);
          node.data = output.data;
          node.error = output.error;
          break;

        case "application/vnd.hbp.mip.experiment.pfa+json":
          results.forEach(aResult => {
            let subResult = aResult;

            // Lift the data one level up if needed
            if (!subResult.type && aResult.data) {
              subResult = normalizedResult(aResult);
            }
            expect(subResult.type).toBeDefined();
            expect(subResult.algorithm).toBeDefined();
            console.log(subResult.type);
            node.mime = subResult.type;
            node.algorithm = subResult.algorithm;

            switch (subResult.type) {
              case "application/vnd.highcharts+json":
                expect(subResult.data).toBeDefined();
                node.data = highcharts(normalizedResult(subResult));
                break;

              case "application/json":
                node.data = jsonTest(normalizedResult(subResult));
                break;

              case "text/plain+error":
                node.error = errorTest(subResult);
                break;

              case "application/vnd.plotly.v1+json":
                console.log("application/vnd.plotly.v1+json");
                break;

              case "application/pfa+json":
                const output2 = pfa(normalizedResult(subResult), hasValidation);
                node.data = output2.data;
                node.error = output2.error;
                break;

              default:
                console.log("!!!!!!!! SHOULD TEST", subResult.type);
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
          node.error = errorTest(results, r.error);
          break;

        default:
          console.log("!!!!!!!! SHOULD TEST", mime);
      }

      // node.data = node.data ? "result" : undefined; // FIXME:
      nodes.push(node);
    });
    experimentResult.nodes = nodes;
    experimentResult.loading = false;
    experimentResults.push(experimentResult);
  });

  // console.log(experimentResults);
  console.log(JSON.stringify(experimentResults, null, 2));
});
