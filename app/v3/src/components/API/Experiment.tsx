import request from 'request-promise-native';
import { Container } from 'unstated';

import { MIP } from '../../types';
import { backendURL } from '../API';
import { Method } from '../API/Core';
import { Query } from '../API/Model';
import APIAdapter from './APIAdapter';

export interface ExperimentPayload {
  algorithms: [Method];
  model: string;
  name: string;
  validations: any;
  source?: string;
}

export interface ExperimentResponse {
  created: Date;
  error?: string;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelDefinitionId: string;
  results?: Node[];
  user?: User;
  algorithms: Method[];
  modelDefinition?: Query;
  validations?: any;
  shared: boolean;
}

export interface User {
  username: string;
  fullname: string;
}

export interface Node {
  name: string;
  methods: Method[];
  // Validation of all predictive methods, ranked by descending order of performance
  rankedCrossValidations?: ValidationScore[];
}

export interface ValidationScore {
  recall: number;
  precision: number;
  f1score: number;
  falsePositiveRate: number;
  accuracy: number;
  weighted?: boolean;
  confusionMatrix?: ConfusionMatrix;
  node: string;
  [key: string]: any;
}

export interface ConfusionMatrix {
  labels: string[];
  values: number[][];
}

export interface PolynomialClassificationScore extends ValidationScore {}
export interface KfoldValidationScore {
  explainedVariance: number;
  mae: number;
  mse: number;
  rsquared: number;
  rmse: number;
  type: string;
  [key: string]: any;
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

  public loaded =
    this.state &&
    this.state.experiment !== undefined &&
    this.state.experiment.results !== undefined &&
    this.state.experiment.error !== undefined;

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/experiments`;
  }

  public one = async ({ uuid }: IUUID) => {
    try {
      const data = await request.get(`${this.baseUrl}/${uuid}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = APIAdapter.parse(json);
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

  public all = async () => {
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
        experiments: json.map((j: ExperimentResponse) => APIAdapter.parse(j))
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public create = async ({ experiment }: { experiment: ExperimentPayload }) => {
    const source = experiment.source;
    const url = source === 'exareme' ? `${this.baseUrl}/exareme` : `${this.baseUrl}`;

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
      const result = APIAdapter.parse(json);
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

  public markAsViewed = async ({ uuid }: IUUID) => this.markExperiment(uuid, 'markAsViewed');

  public markAsShared = async ({ uuid }: IUUID) => this.markExperiment(uuid, 'markAsShared');

  public markAsUnshared = async ({ uuid }: IUUID) => this.markExperiment(uuid, 'markAsUnshared');

  private markExperiment = async (uuid: string, action: string) => {
    try {
      const data = await request.get(`${this.baseUrl}/${uuid}/${action}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = APIAdapter.parse(json);
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
