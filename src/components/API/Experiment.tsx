import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { Algorithm } from '../API/Core';
import { Query } from '../API/Model';
import { User } from '../API/User';
import ExperimentResultParser from './ExperimentResultParser';
import { MIME_TYPES } from '../constants';

export interface ExperimentPayload {
  algorithms: Algorithm[];
  model: string;
  name: string;
}

export interface ExperimentResponse {
  created: Date;
  error?: string;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelSlug: string;
  results?: Result[] | Node[];
  user?: User;
  algorithms: Algorithm[];
  modelQuery?: Query;
  shared: boolean;
}

export interface ExperimentResponseRaw extends ExperimentResponse {
  algorithms: any;
  model: { slug: string };
  createdBy: { fullname: string; username: string };
  hasServerError: boolean;
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
