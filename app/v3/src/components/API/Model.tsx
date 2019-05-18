import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { VariableEntity } from './Core';

export interface ModelState {
  error?: string;
  model?: ModelResponse;
  draft?: ModelResponse;
  models?: ModelResponse[];
}
export interface ModelResponse {
  error?: string;
  slug?: string;
  title: string;
  valid?: boolean;
  createdAt?: number;
  query: Query;
  dataset?: any; // FIXME: not used in api
  config?: any; // FIXME: not used in api
  createdBy?: IUser;
  parentSlug?: string;
}

export interface IUser {
  agreeNDA?: boolean;
  fullname: string;
  languages?: string[];
  picture?: string;
  roles?: string[];
  username: string;
  votedApps?: string[];
}
export interface Query {
  filters: string;
  filterVariables?: VariableEntity[];
  variables?: VariableEntity[];
  coVariables?: VariableEntity[];
  groupings?: VariableEntity[];
  trainingDatasets?: VariableEntity[];
  testingDatasets?: VariableEntity[];
  validationDatasets?: VariableEntity[];
  [key: string]: any;
}

class Model extends Container<ModelState> {
  public state: ModelState = {};

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/models`;
  }

  public setDraft = async (draft: ModelResponse) => {
    return await this.setState({
      draft,
      error: undefined
    });
  };

  public one = async (slug: string) => {
    this.setState({
      error: undefined,
      model: undefined
    });
    try {
      const data = await request.get(`${this.baseUrl}/${slug}`, this.options);
      const json: ModelResponse = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        model: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public update = async ({ model }: { model: any }) => {
    try {
      const { slug } = model;
      await request({
        body: JSON.stringify(model),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'PUT',
        uri: `${this.baseUrl}/${slug}`
      });
      return await this.setState({
        error: undefined,
        model
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public save = async ({
    model,
    title
  }: {
    model: any;
    title: string;
  }): Promise<any> => {
    const modelTemplate = {
      config: {
        title: {
          text: title
        }
      },
      createdAt: 1540561037000,
      dataset: {
        code: 'DS1540825503020'
      },
      query: model.query,
      title,
      valid: true
    };

    try {
      const data = await request({
        body: JSON.stringify(modelTemplate),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.baseUrl}`
      });
      const json = await JSON.parse(data);
      await this.setState({
        error: undefined,
        model: json
      });

      return json.slug;
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public all = async () => {
    try {
      const data = await request.get(`${this.baseUrl}`, this.options);
      const json: ModelResponse[] = await JSON.parse(data);

      return await this.setState({
        error: undefined,
        models: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Model;
