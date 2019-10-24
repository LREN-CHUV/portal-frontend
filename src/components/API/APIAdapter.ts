import { ALGORITHM_DEFAULT_OUTPUT, MIME_TYPES } from '../constants';
import { Engine, ExperimentResponse, Result } from './Experiment';
import { buildWorkflowAlgorithmResponse } from './WorkflowAPIAdapter';

export const defaultResults = (name: string, results: Result[]): Result[] => {
  const config =
    ALGORITHM_DEFAULT_OUTPUT.find(a => a.name === name) || undefined;

  const nextResults = results.filter(
    r => config && config.types.includes(r.type)
  );

  return nextResults;
};

const parse = (value: any) => {
  try {
    const json = JSON.parse(value);
    return json;
  } catch (e) {
    return value;
  }
};

class APIAdapter {
  public static parse = (experiment: any): ExperimentResponse => {
    // FIXME: Formats are differents in the API for experiment, experimentList and runExperiment,
    // apply specific parsing to some terms
    const algorithms = parse(experiment.algorithms);
    const created = (() => {
      const d = Date.parse(experiment.created + ' GMT');
      if (isNaN(d)) {
        return new Date(experiment.created);
      }

      return new Date(d);
    })();
    const modelDefinitionId = experiment.model ? experiment.model.slug : null;

    let experimentResponse: ExperimentResponse = {
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
        error: 'No model defined',
        modelDefinitionId: 'undefined'
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
          error: 'Timeout after 5 mn'
        };
      }

      return experimentResponse;
    }

    // Branch backend responses based on data shape
    try {
      const resultParsed = parse(experiment.result);
      const p =
        resultParsed && resultParsed.length > 0 && resultParsed[0].result;
      const e =
        resultParsed && resultParsed.length > 0 && resultParsed[0].error;

      if (e) {
        return {
          ...experimentResponse,
          engine: Engine.Exareme,
          results: [
            {
              type: MIME_TYPES.ERROR,
              data: e
            }
          ]
        };
      }

      if (p) {
        const isExareme = p.every((r: any) => r.data && r.type);
        if (isExareme) {
          const algorithmName = experimentResponse.algorithms[0].name;
          const response = {
            ...experimentResponse,
            engine: Engine.Exareme,
            results: defaultResults(algorithmName, p)
          };

          return response;
        }
      }

      const isWorkflow = resultParsed.find((r: any) => r.historyId);
      if (isWorkflow) {
        const nextResult3 = buildWorkflowAlgorithmResponse(
          isWorkflow.historyId,
          experimentResponse
        );

        return nextResult3;
      }

      return experimentResponse;
    } catch (e) {
      console.log(e);
      return {
        ...experimentResponse,
        error: e
      };
    }
  };
}

export default APIAdapter;
