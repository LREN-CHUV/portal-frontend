import { ALGORITHM_DEFAULT_OUTPUT, MIME_TYPES } from '../constants';
import { ExperimentResponse, Result } from './Experiment';

export const defaultResults = (name: string, results: Result[]): Result[] => {
  const config =
    ALGORITHM_DEFAULT_OUTPUT.find(a => a.name === name) || undefined;

  const nextResults = results.filter(
    r => config && config.types.includes(r.type)
  );

  console.log(nextResults);
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
    const modelSlug = experiment.model ? experiment.model.slug : null;

    let experimentResponse: ExperimentResponse = {
      algorithms,
      created,
      modelQuery: experiment.model && experiment.model,
      modelSlug,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      shared: experiment.shared,
      uuid: experiment.uuid
    };

    experimentResponse.user = experiment.createdBy
      ? {
          fullname: experiment.createdBy.fullname,
          username: experiment.createdBy.username
        }
      : undefined;

    // Errors
    if (!modelSlug) {
      experimentResponse = {
        ...experimentResponse,
        error: 'No model defined',
        modelSlug: 'undefined'
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
      const flattenedResults =
        resultParsed && resultParsed.length > 0 && resultParsed[0].result;
      const errorResults =
        resultParsed && resultParsed.length > 0 && resultParsed[0].error;

      if (errorResults) {
        return {
          ...experimentResponse,
          results: [
            {
              type: MIME_TYPES.ERROR,
              data: errorResults
            }
          ]
        };
      }

      if (flattenedResults) {
        const algorithmName = experimentResponse.algorithms[0].name;
        const response = {
          ...experimentResponse,
          results: defaultResults(algorithmName, flattenedResults)
        };

        return response;
      }

      return {
        ...experimentResponse,
        error: `Sorry. The algorithm output was of an unexpected format. Parsing failed. ${JSON.stringify(
          resultParsed,
          null,
          2
        )}`
      };
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
