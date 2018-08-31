// tslint:disable:no-console
import {
  IExperimentResult,
  IMethod,
  INode,
  IPolynomialClassificationScore,
  IValidationScore
} from "@app/types";

class ParseExperiment {
  public static parse = (experiment: any): IExperimentResult => {
    // Formats are differents in the API for 1 experiment and array of experiments, apply specific parsing to some terms
    const algorithms = parse(experiment.algorithms);
    const created = (() => {
      const d = Date.parse(experiment.created + " GMT");
      if (isNaN(d)) {
        return new Date(experiment.created);
      }

      return new Date(d);
    })();
    let experimentResult: IExperimentResult = {
      algorithms: algorithms.map((e: any) => e.name),
      created,
      finished: experiment.finished,
      modelDefinitionId: experiment.model.slug,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      user: {
        fullname: experiment.createdBy.fullname,
        username: experiment.createdBy.username
      },
      uuid: experiment.uuid
    };

    if (experiment.hasServerError) {
      experimentResult = {
        ...experimentResult,
        error: `${experiment.result}`
      };

      return experimentResult;
    }

    if (!experiment.result) {
      const elapsed: number =
        (new Date().getTime() - experimentResult.created.getTime()) / 1000;

      if (elapsed > 60 * 5) {
        experimentResult = {
          ...experimentResult,
          error: "Timeout after 5 mn"
        };
      }

      return experimentResult;
    }

    const result = parse(experiment.result);
    const nodes: INode[] = [];
    // const distinctNodeCount = result
    //   .map((r: any) => r.node)
    //   .filter((el: any, i: any, a: any) => i === a.indexOf(el)).length;

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
          method.data = [pfa(results)];
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
                console.log("application/vnd.plotly.v1+json");
                break;

              case "application/pfa+json":
                method.data = [pfa(normalizedResult(subResult))];
                break;

              default:
                console.log("!!!!!!!! SHOULD TEST", subResult.type);
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
          method = {
            ...method,
            algorithm: "no data",
            error: "no data",
            mime: "no data"
          };
      }

      // In case we have 2 methods on 2 same nodes
      // merge nodes
      if (nodes.length) {
        const node: INode | undefined = nodes.find(
          (n: any) => n.name === r.node
        );
        if (node) {
          node.methods.push(method);
        }
      } else {
        const node: INode = {
          methods: [method],
          name: r.node || "Default"
        };
        nodes.push(node);
      }
    });
    experimentResult.nodes = nodes;

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
    try {
      const subError = JSON.parse(data);
      errorOutput = subError.error;
    } catch (e) {
      errorOutput = data.error;
    }
  } else {
    errorOutput = error;
  }

  return errorOutput.slice(-256);
};

const parse = (value: any) => {
  try {
    const json = JSON.parse(value);
    return json;
  } catch (e) {
    return value;
  }
};
