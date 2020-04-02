import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import {
  Algorithm,
  AlgorithmParameter,
  AlgorithmParameterRequest
} from '../API/Core';
import { ModelResponse, Query } from '../API/Model';
import { User } from '../API/User';
import { MIME_TYPES } from '../constants';
import ExperimentResultParser from './ExperimentResultParser';

export interface ExperimentPayload {
  algorithms: Algorithm[];
  model: string;
  name: string;
  label: string;
}

export interface ExperimentResponse {
  created: Date;
  error?: string | boolean;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelSlug: string;
  results?: Result[] | Node[];
  user?: User;
  algorithms: Algorithm[];
  modelQuery?: Query;
  shared: boolean;
  hasServerError: boolean;
}

export interface ExperimentResponseRaw extends ExperimentResponse {
  algorithms: any;
  model: { slug: string };
  createdBy: { fullname: string; username: string };
  result: string;
}

export interface Result {
  type: MIME_TYPES;
  data: any;
}

interface IUUID {
  uuid: string;
}

export interface State {
  error?: string;
  experiment?: ExperimentResponse;
  experiments?: ExperimentResponse[];
}

class Experiment extends Container<State> {
  public state: State = {};

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/experiments`;
  }

  public makeParameters = (
    model: ModelResponse,
    selectedAlgorithm: Algorithm,
    parameters: AlgorithmParameter[]
  ): AlgorithmParameterRequest[] =>
    parameters.map(p => {
      let value: string = p.value;
      const query = model && model.query;

      if (query) {
        if (p.label === 'x') {
          let covariablesArray =
            (query.coVariables && query.coVariables.map(v => v.code)) || [];
          covariablesArray = query.groupings
            ? [...covariablesArray, ...query.groupings.map(v => v.code)]
            : covariablesArray;

          if (covariablesArray.length > 0) {
            const design = parameters.find(p => p.label === 'design');
            // FIXME: a+b doesn't work for multiple histograms, cart
            if (
              design &&
              selectedAlgorithm.label !== 'Multiple Histograms' &&
              selectedAlgorithm.label !== 'CART' &&
              selectedAlgorithm.label !== 'ID3' &&
              selectedAlgorithm.label !== 'Naive Bayes Training'
            ) {
              value =
                design.value === 'additive'
                  ? covariablesArray.toString().replace(/,/g, '+')
                  : covariablesArray.toString().replace(/,/g, '*');
            } else {
              value = covariablesArray.toString();
            }
          }
        }

        if (p.label === 'y') {
          // TEST_PAIRED
          // TODO: this will be replaced by the formula field and should be removed when it occurs
          const isVector = selectedAlgorithm.name === 'TTEST_PAIRED';
          const varCount = (query.variables && query.variables.length) || 0;
          value = isVector
            ? (query.variables &&
                query.variables // outputs: a1-a2,b1-b2, c1-a1
                  .reduce(
                    (vectors: string, v, i) =>
                      (i + 1) % 2 === 0
                        ? `${vectors}${v.code},`
                        : varCount === i + 1
                        ? `${vectors}${v.code}-${query.variables &&
                            query.variables[0].code}`
                        : `${vectors}${v.code}-`,
                    ''
                  )
                  .replace(/,$/, '')) ||
              ''
            : (query.variables &&
                query.variables.map(v => v.code).toString()) ||
              '';
        }

        if (p.label === 'dataset') {
          value =
            (query.trainingDatasets &&
              query.trainingDatasets.map(v => v.code).toString()) ||
            '';
        }

        if (p.label === 'pathology') {
          value = (query.pathology && query.pathology.toString()) || '';
        }

        if (p.label === 'filter') {
          value = (query.filters && query.filters) || '';
        }
      }

      return {
        name: p.name,
        label: p.label,
        value
      };
    });

  public loaded = (): boolean =>
    this.state.experiment !== undefined &&
    this.state.experiment.results !== undefined;

  public one = async ({ uuid }: IUUID): Promise<void> => {
    try {
      // mark status and refresh the list
      if (
        this.state.experiments?.find(e => e.uuid === uuid)?.resultsViewed ===
        false
      ) {
        await request.get(`${this.baseUrl}/${uuid}/markAsViewed`, this.options);
        await this.setState(previousState => ({
          experiments: previousState.experiments?.map(e => ({
            ...e,
            resultsViewed: e.uuid === uuid ? true : e.resultsViewed
          }))
        }));
      }

      const data = await request.get(`${this.baseUrl}/${uuid}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = ExperimentResultParser.parse(json);

      return await this.setState({
        error: undefined,
        experiment
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public all = async (): Promise<void> => {
    try {
      const data = await request.get(`${this.baseUrl}?mine=true`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        experiments: json.map((j: ExperimentResponseRaw) =>
          ExperimentResultParser.parse(j)
        )
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public create = async ({
    experiment
  }: {
    experiment: ExperimentPayload;
  }): Promise<void> => {
    const url = `${this.baseUrl}/runAlgorithm`;

    try {
      const data = await request({
        body: JSON.stringify(experiment),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: url
      });
      const json = await JSON.parse(data);
      const result = ExperimentResultParser.parse(json);

      return await this.setState({
        error: undefined,
        experiment: result
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public markAsViewed = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsViewed');

  public markAsShared = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsShared');

  public markAsUnshared = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsUnshared');

  private markExperiment = async (
    uuid: string,
    action: string
  ): Promise<void> => {
    try {
      const data = await request.get(
        `${this.baseUrl}/${uuid}/${action}`,
        this.options
      );
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = ExperimentResultParser.parse(json);
      return await this.setState({
        error: undefined,
        experiment
      });
    } catch (error) {
      console.log({ error });
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Experiment;
