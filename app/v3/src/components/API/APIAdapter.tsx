import { MIME_TYPES, SCORES } from "@app/components/constants";
import { MIP } from "@app/types";

class APIAdapter {
  public static parse = (experiment: any): MIP.API.IExperimentResponse => {
    // Formats are differents in the API for experiment, experimentList and runExperiment,
    // apply specific parsing to some terms
    const algorithms = parse(experiment.algorithms);
    const created = (() => {
      const d = Date.parse(experiment.created + " GMT");
      if (isNaN(d)) {
        return new Date(experiment.created);
      }

      return new Date(d);
    })();
    const modelDefinitionId = experiment.model ? experiment.model.slug : null;

    let experimentResponse: MIP.API.IExperimentResponse = {
      algorithms,
      created,
      modelDefinition: experiment.model ? experiment.model.query : undefined,
      modelDefinitionId,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      shared: experiment.shared,
      uuid: experiment.uuid,
      validations: experiment.validations
    };

    experimentResponse.user = experiment.createdBy
      ? {
          fullname: experiment.createdBy.fullname,
          username: experiment.createdBy.username
        }
      : undefined;

    // Errors
    if (!modelDefinitionId) {
      experimentResponse = {
        ...experimentResponse,
        error: "No model defined",
        modelDefinitionId: "undefined"
      };

      return experimentResponse;
    }

    if (experiment.hasServerError) {
      experimentResponse = {
        ...experimentResponse,
        error: `${experiment.result}`
      };

      return experimentResponse;
    }

    if (!experiment.result) {
      const elapsed: number =
        (new Date().getTime() - experimentResponse.created.getTime()) / 1000;

      if (elapsed > 60 * 5) {
        experimentResponse = {
          ...experimentResponse,
          error: "Timeout after 5 mn"
        };
      }

      return experimentResponse;
    }

    // Results
    const resultParsed = parse(experiment.result);
    const result = Array.isArray(resultParsed) ? resultParsed : [resultParsed];
    const nodes: MIP.API.INode[] = [];

    result.forEach((r: any, i: number) => {
      const mime = r.type;
      const algorithm =
        experimentResponse.algorithms.length - 1 === i
          ? experimentResponse.algorithms[i]
          : experimentResponse.algorithms[0];
      let method: any = {
        algorithm: r.algorithm || algorithm,
        mime
      };

      if (r.Error) {
        // EXAREME
        method.error = r.Error;
      }

      // Convert to array to have consistent results
      const normalizedResult = (input: any) =>
        (input.data &&
          (Array.isArray(input.data) ? input.data : [input.data])) ||
        null;
      const results = normalizedResult(r);

      switch (mime) {
        case MIME_TYPES.HIGHCHARTS:
          method.data = highcharts(results);
          break;

        case MIME_TYPES.PLOTLY:
          method.data = plotly(results);
          break;

        case MIME_TYPES.PFA:
          method.data = [pfa(results)];
          break;

        case MIME_TYPES.JSON:
          method.data = jsonTest(results);
          break;

        case MIME_TYPES.JSONDATA:
          method.data = jsonTest(results);
          break;

        case MIME_TYPES.VISJS: // EXAREME
          const visFunction = results[0].data.result.slice(1, -1);
          method.data = [`<script>var network; ${visFunction}</script>`];
          break;

        case MIME_TYPES.HTML:
          const html = results.map((result1: any) =>
            result1.replace(
              "\u0026lt;!DOCTYPE html\u0026gt;",
              "<!DOCTYPE html>"
            )
          );
          method.data = html;
          break;

        case MIME_TYPES.ERROR:
          method.error = errorTest(results, r.error);
          break;

        case MIME_TYPES.MIP_PFA:
        case MIME_TYPES.MIP_COMPOUND: 
          results.forEach((aResult: any) => {
            let subResult = aResult;

            // Lift the data one level up if needed
            if (!subResult.type && aResult.data) {
              subResult = normalizedResult(aResult);
            }
            method.mime = subResult.type;
            method.algorithm = subResult.algorithm;

            switch (subResult.type) {
              case MIME_TYPES.HIGHCHARTS:
                method.data = highcharts(normalizedResult(subResult));
                break;

              case MIME_TYPES.JSON:
                method.data = jsonTest(normalizedResult(subResult));
                break;

              case MIME_TYPES.ERROR:
                method.error = errorTest(subResult, null);
                break;

              case MIME_TYPES.PLOTLY:
                method.data = plotly(normalizedResult(subResult));
                break;

              case MIME_TYPES.PFA:
                method.data = [pfa(normalizedResult(subResult))];
                break;

              case MIME_TYPES.TEXT:
                method.data = subResult;
                break;

              case MIME_TYPES.JSONDATA:
                method.data = jsonTest(normalizedResult(subResult));
                break;

              default:
                throw new Error(`"!!!!!!!! SHOULD TEST" ${subResult.type}`);
                break;
            }
          });
          break;

        default:
          method = {
            ...method,
            algorithm: "no data",
            error: "no data",
            mime
          };
      }

      // In case we have 2 methods on 2 same nodes
      // merge nodes
      // if (nodes.length) {
      //   const node: INode | undefined =
      //     nodes && nodes.find((n: any) => n.name === r.node);
      //   if (node) {
      //     console.log(`node.name ${node.name}`)
      //     node.methods.push(method);
      //   }
      // } else {
      const node: MIP.API.INode = {
        methods: [method],
        name: r.node || "Default"
      };
      // node.methods.push(method);
      //   nodes.push(node);
      // }
      nodes.push(node);
    });
    // console.log({nodes})
    experimentResponse.results = nodes.sort(
      (a: MIP.API.INode, b: MIP.API.INode) => a.name.localeCompare(b.name)
    );

    return experimentResponse;
  };
}

export default APIAdapter;

const highcharts = (data: any) => {
  return data;
};

const plotly = (data: any) => {
  return [
    {
      data,
      layout: { margin: { l: 400 } }
    }
  ];
};

interface IPfa {
  crossValidation?:
    | MIP.API.IKfoldValidationScore
    | MIP.API.IValidationScore
    | MIP.API.IPolynomialClassificationScore;
  data?: any;
  remoteValidation?:
    | MIP.API.INode
    | MIP.API.IKfoldValidationScore
    | MIP.API.IValidationScore
    | MIP.API.IPolynomialClassificationScore;
  error?: any;
}

const pfa = (data: any): IPfa => {
  const output: IPfa = {};

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

        const buildKFoldValidation = (dta: any) => ({
          explainedVariance: parseFloat(dta[SCORES.explainedVariance.code]),
          mae: parseFloat(dta[SCORES.mae.code]),
          mse: parseFloat(dta[SCORES.mse.code]),
          rmse: parseFloat(dta[SCORES.rmse.code]),
          rsquared: parseFloat(dta[SCORES.rsquared.code]),
          type: `${dta[SCORES.type.code]}`
        });

        const buildValidation = (dta: any, node: any) => ({
          accuracy: parseFloat(dta[SCORES.accuracy.code]),
          confusionMatrix: dta[SCORES.confusionMatrix.code],
          f1score: parseFloat(dta[SCORES.f1score.code]),
          falsePositiveRate: parseFloat(dta[SCORES.falsePositiveRate.code]),
          node: `${node}`,
          precision: parseFloat(dta[SCORES.precision.code]),
          recall: parseFloat(dta[SCORES.recall.code])
        });

        init.forEach((i: any) => {
          if (i.error) {
            output.error += i.error;
            return;
          } else {
            const node = i.node;
            if (i.code === "kfold") {
              const dta: any = i.data.average;
              if (dta.type === 'PolynomialClassificationScore') {
                output.crossValidation = buildValidation(dta, node);
              } else {
                output.crossValidation = buildKFoldValidation(dta);
              }
            }

            if (i.code === "remote-validation") {
              const dta: any = i.data;
              if (dta.type === "RegressionScore") {
                output.remoteValidation = buildKFoldValidation(dta);
              } else {
                output.remoteValidation = buildValidation(dta, node);
              }
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
