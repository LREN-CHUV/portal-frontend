import {
  IExperimentResult,
  IMethod,
  INode,
  IPolynomialClassificationScore,
  IValidationScore
} from "@app/types";


class ParseExperiment {

  public static parse = (experiment: any) : IExperimentResult => {
    let experimentResult: IExperimentResult = {
      created: new Date(experiment.created),
      loading: true,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      uuid: experiment.uuid
    };

    if (!experiment.model) {
      experimentResult.error = "No model defined";
      experimentResult.loading = false;

      return experimentResult;
    }

    experimentResult = {
      ...experimentResult,
      modelDefinitionId: experiment.model.slug
    };

    if (experiment.hasServerError) {
      experimentResult = {
        ...experimentResult,
        error: `${experiment.result}`,
        loading: false
      };

      return experimentResult;
    }

    if (!experiment.result) {
      const elapsed: number =
        (new Date().getTime() - new Date(experiment.created).getTime()) / 1000;

      if (elapsed > 60 * 5) {
        experimentResult = {
          ...experimentResult,
          error: "Timeout after 5 mn",
          loading: false
        };
      }

      return experimentResult;
    }

    const algo = parse(experiment.algorithms);
    const codes = algo.map((a: any) => a.code);

    if (
      codes.includes("PIPELINE_ISOUP_MODEL_TREE_SERIALIZER") ||
      codes.includes("WP_LINEAR_REGRESSION")
    ) {
      experimentResult = {
        ...experimentResult,
        error: "Exareme",
        loading: false
      };

      return experimentResult;
    }

    const result = parse(experiment.result);
    const nodes: INode[] = [];
    result.forEach((r: any, i: number) => {
      const mime = r.type;

      let method: IMethod = {
        algorithm: r.algorithm,
        mime
      };

      // Convert to array to have consistent results
      const normalizedResult = (input: any) =>
        (input.data && (input.data.length ? input.data : [input.data])) || null;

      const results = normalizedResult(r);
      switch (mime) {
        case "application/vnd.highcharts+json":
          method.data = highcharts(results);
          break;

        case "application/vnd.plotly.v1+json":
          method.data = plotly(results);
          break;

        case "application/pfa+json":
          method = {
            ...method,
            ...pfa(results)
          };

          break;

        case "application/vnd.hbp.mip.experiment.pfa+json":
          results.forEach((aResult: any) => {
            let subResult = aResult;

            // Lift the data one level up if needed
            if (!subResult.type && aResult.data) {
              subResult = normalizedResult(aResult);
            }
            method.mime = subResult.type;
            method.algorithm = subResult.algorithm;

            switch (subResult.type) {
              case "application/vnd.highcharts+json":
                method.data = highcharts(normalizedResult(subResult));
                break;

              case "application/json":
                method.data = jsonTest(normalizedResult(subResult));
                break;

              case "text/plain+error":
                method.error = errorTest(subResult, null);
                break;

              case "application/vnd.plotly.v1+json":
                // console.log("application/vnd.plotly.v1+json");
                break;

              case "application/pfa+json":
                method = {
                  ...method,
                  ...pfa(normalizedResult(subResult))
                };

                break;

              default:
              // console.log("!!!!!!!! SHOULD TEST", subResult.type);
            }
          });

        case "application/json":
          method.data = jsonTest(results);
          break;

        // case "application/vnd.dataresource+json":
        //   break;

        // case "application/vnd.visjs+javascript":
        // break;

        case "text/plain+error":
          method.error = errorTest(results, r.error);
          break;

        default:
        // console.log("!!!!!!!! SHOULD TEST", mime);
      }

      // node.data = node.data ? "result" : undefined; // FIXME:
      const node: INode = {
        methods: [method],
        name: r.node
      };
      nodes.push(node);
    });
    experimentResult.nodes = nodes;
    experimentResult.loading = false;

    return experimentResult;
  };
}

export default ParseExperiment;

const highcharts = (data: any) => {
  return data;
};

const plotly = (data: any) => {
  return data;
};

interface IPfa {
  crossValidation?: IValidationScore | IPolynomialClassificationScore;
  data?: any;
  remoteValidations?: INode | IValidationScore | IPolynomialClassificationScore;
  error?: any;
}

const pfa = (data: any): IPfa => {
  const output: IPfa = {};

  const accuracyKey = "Accuracy";
  const f1scoreKey = "Weighted F1-score";
  const falsePositiveRateKey = "Weighted false positive rate";
  const precisionKey = "Weighted precision";
  const recallKey = "Weighted recall";
  const confusionMatrixKey = "Confusion matrix";

  data.forEach((d: any) => {
    if (!d.cells) {
      // output.data.push(d);
      output.error = "WARNING, not handled";
    } else {
      if (d.cells.validations) {
        // Convert to array to have consistent results
        const init = d.cells.validations.init.length
          ? d.cells.validations.init
          : [d.cells.validations.init];

        const buildValidation = (dta: any, node: any) => ({
          accuracy: parseFloat(dta[accuracyKey]),
          confusionMatrix: dta[confusionMatrixKey],
          f1score: parseFloat(dta[f1scoreKey]),
          falsePositiveRate: parseFloat(dta[falsePositiveRateKey]),
          node: `${node}`,
          precision: parseFloat(dta[precisionKey]),
          recall: parseFloat(dta[recallKey])
        });

        init.forEach((i: any) => {
          if (i.error) {
            output.error += i.error;
            return;
          } else {
            const node = i.node;
            if (i.code === "kfold") {
              const dta: any = i.data.average;
              output.crossValidation = buildValidation(dta, node);
            }

            if (i.code === "remote-validation") {
              const dta: any = i.data;
              output.remoteValidations = buildValidation(dta, node);
            }
          }
        });
      }
    }
  });

  return output;
};

const jsonTest = (data: any) => {
  return data;
};

const errorTest = (data: any, error: any) => {
  let errorOutput;
  if (data) {
    errorOutput = data.error;
  } else {
    errorOutput = error;
  }

  return errorOutput.slice(-144);
};

const parse = (value: any) => {
  try {
    const json = JSON.parse(value);
    return json;
  } catch (e) {
    throw new Error(e);
  }
};
