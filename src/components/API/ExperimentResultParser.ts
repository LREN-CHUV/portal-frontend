import { ENABLED_ALGORITHMS, ERRORS_OUTPUT, MIME_TYPES } from '../constants';
import {
  ExperimentResponse,
  ExperimentResponseRaw,
  Result
} from './Experiment';

const parse = (value: string): any => {
  try {
    const json = JSON.parse(value);
    return json;
  } catch (e) {
    return value;
  }
};

class APIAdapter {
  public static parse = (
    experiment: ExperimentResponseRaw
  ): ExperimentResponse => {
    // FIXME: Formats are differents in the API for experiment, experimentList and runExperiment,
    // apply specific parsing to some terms
    const algorithms = parse(experiment.algorithms);
    const created = ((): Date => {
      const d = Date.parse(experiment.created + ' GMT');
      if (isNaN(d)) {
        return new Date(experiment.created);
      }

      return new Date(d);
    })();
    const modelSlug = experiment.model ? experiment.model.slug : '';

    let experimentResponse: ExperimentResponse = {
      algorithms,
      created,
      modelQuery: experiment.model,
      modelSlug,
      name: experiment.name,
      resultsViewed: experiment.resultsViewed,
      shared: experiment.shared,
      hasServerError: experiment.hasServerError,
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
        error:
          'There was an error running your experiment, please contact the system administrator.'
      };

      return experimentResponse;
    }

    if (!experiment.result) {
      return experimentResponse;
    }

    try {
      const resultParsed = parse(experiment.result);
      const flattenedResults =
        resultParsed &&
        resultParsed.reduce(
          (acc: Result[], item: { result: Result[] }) => [
            ...acc,
            ...item.result
          ],
          []
        );

      if (flattenedResults) {
        const algorithmLabel = experimentResponse.algorithms[0].label;
        const config =
          ENABLED_ALGORITHMS.find(a => a.label === algorithmLabel) || undefined;

        const nextResults = flattenedResults.filter(
          (r: Result) => config && config.types.includes(r.type)
        );

        const errorResults = flattenedResults.filter((r: Result) =>
          ERRORS_OUTPUT.includes(r.type)
        );

        if (errorResults.length > 0) {
          const error =
            errorResults && errorResults.length > 0 && errorResults[0].data;

          return {
            ...experimentResponse,
            error
          };
        }

        // FIXME
        const finalResults =
          algorithmLabel === 'CART'
            ? nextResults.map((r: Result) => ({
                ...r,
                type: MIME_TYPES.JSONBTREE
              }))
            : nextResults;

        const response = {
          ...experimentResponse,
          results: finalResults
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
