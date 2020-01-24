import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { Algorithm } from '../API/Core';
import { Query } from '../API/Model';
import { User } from '../API/User';
import APIAdapter from './APIAdapter';
import { MIME_TYPES } from '../constants';

export interface ExperimentPayload {
  algorithms: Algorithm[];
  model: string;
  name: string;
  engine?: Engine;
  validations: any[]; // FIXME: deprecated
}

export enum Engine {
  Exareme,
  Workflow
}

export interface ExperimentResponse {
  created: Date;
  error?: string;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelDefinitionId: string;
  results?: Result[] | Node[];
  user?: User;
  algorithms: Algorithm[];
  modelDefinition?: Query;
  validations?: any;
  shared: boolean;
  engine?: Engine;
}

export interface Result {
  type: MIME_TYPES;
  data: any;
}

export interface ConfusionMatrix {
  labels: string[];
  values: number[][];
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

  public loaded = (): boolean =>
    this.state.experiment !== undefined &&
    this.state.experiment.results !== undefined;

  public one = async ({ uuid }: IUUID): Promise<void> => {
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
        experiments: json.map((j: ExperimentResponse) => APIAdapter.parse(j))
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
    const engine = experiment.engine;
    const url =
      engine === Engine.Exareme
        ? `${this.baseUrl}/exareme`
        : engine === Engine.Workflow
        ? `${this.baseUrl}/workflow`
        : `${this.baseUrl}`;

    // console.log(url, experiment);
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
