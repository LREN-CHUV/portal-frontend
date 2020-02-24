import {
  ALGORITHM_DEFAULT_OUTPUT,
  MIME_TYPES,
  ERRORS_OUTPUT
} from '../constants';
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
        const algorithmName = experimentResponse.algorithms[0].name;
        const config =
          ALGORITHM_DEFAULT_OUTPUT.find(a => a.name === algorithmName) ||
          undefined;

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
            // results: [
            //   {
            //     type: MIME_TYPES.ERROR,
            //     data: error
            //   }
            // ]
          };
        }

        const response = {
          ...experimentResponse,
          results: nextResults
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
