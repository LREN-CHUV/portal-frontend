import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { LONGITUDINAL_DATASET_TYPE } from '../constants';
import { VariableEntity } from './Core';
import { VariableDatum } from '../Explore/d3Hierarchy';

export type HierarchyCircularNode = d3.HierarchyCircularNode<VariableDatum>;

export interface D3Model {
  covariables: HierarchyCircularNode[] | undefined;
  filters: HierarchyCircularNode[] | undefined;
  variables: HierarchyCircularNode[] | undefined;
}

export interface ModelState {
  error?: string;
  model?: ModelResponse;
  models?: ModelResponse[];
  internalD3Model: D3Model;
}
export interface ModelResponse {
  error?: string;
  slug?: string;
  title?: string;
  valid?: boolean;
  createdAt?: number;
  query: Query;
  dataset?: any; // FIXME: not used in api
  config?: any; // FIXME: not used in api
  createdBy?: IUser;
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
  filters?: string;
  pathology?: string;
  filterVariables?: VariableEntity[];
  variables?: VariableEntity[];
  coVariables?: VariableEntity[];
  groupings?: VariableEntity[];
  trainingDatasets?: VariableEntity[];
  testingDatasets?: VariableEntity[];
  validationDatasets?: VariableEntity[];
  [key: string]: any;
  formulaString?: string;
}

const initialD3Model = {
  covariables: undefined,
  filters: undefined,
  variables: undefined
};

class Model extends Container<ModelState> {
  public state: ModelState = {
    internalD3Model: initialD3Model
  };

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/models`;
  }

  // Check if the model's datasets have been removed in the API
  public checkModelDatasets = (
    currentDatasets: VariableEntity[] | undefined
  ): void => {
    const datasetCodes = currentDatasets?.map(d => d.code);
    const model = this.state.model;

    if (model) {
      const query = model?.query;
      const trainingDatasets = query?.trainingDatasets?.map(t => t.code);
      if (
        datasetCodes?.sort().toString() !== trainingDatasets?.sort().toString()
      ) {
        const updatedDatasets = query?.trainingDatasets?.filter(t =>
          datasetCodes?.includes(t.code)
        );

        model.query.trainingDatasets = updatedDatasets;

        this.update({ model });
      }
    }
  };

  public setModel = async (model?: ModelResponse): Promise<void> => {
    return await this.setState({
      model
    });
  };

  public setD3Model = async (internalD3Model: D3Model): Promise<void> => {
    const model = this.convertD3ModelToModel(internalD3Model);
    return await this.setState({
      internalD3Model,
      model
    });
  };

  // FIXME: longitudinal datasets should be tagged
  public isDatasetLongitudinal = (
    trainingDatasets: VariableEntity[] | undefined
  ): boolean => {
    const r = new RegExp(LONGITUDINAL_DATASET_TYPE);
    const isLongitudinalDataset =
      trainingDatasets?.find(d => r.test(d.code)) !== undefined || false;

    return isLongitudinalDataset;
  };

  public selectDataset = (dataset: VariableEntity): void => {
    const model = this.state.model;
    const trainingDatasets =
      (model && model.query && model.query.trainingDatasets) || [];
    const isLongitudinal = this.isDatasetLongitudinal([dataset]);
    const r = new RegExp(LONGITUDINAL_DATASET_TYPE);

    // TODO: tag dataset as longitudinal
    const nextDatasets = trainingDatasets
      .map(d => d.code)
      .includes(dataset.code)
      ? [...trainingDatasets.filter(d => d.code !== dataset.code)]
      : isLongitudinal
      ? [...trainingDatasets.filter(d => r.test(d.code)), dataset]
      : [...trainingDatasets.filter(d => !r.test(d.code)), dataset];

    if (model) {
      model.query.trainingDatasets = nextDatasets;
      this.setModel(model);
    }
  };

  public one = async (slug?: string) => {
    this.setState({
      error: slug ? undefined : "Can't find model",
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

  public update = async ({
    model
  }: {
    model: ModelResponse;
  }): Promise<void> => {
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

      this.all(); // refetch all models
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

  // Utility to convert  D3 model to variables
  public convertD3ModelToModel = (d3Model: D3Model): ModelResponse => {
    const model = this.state.model;
    const datasets = model && model.query && model.query.trainingDatasets;

    const query: Query = {
      coVariables:
        (d3Model.covariables &&
          d3Model.covariables
            .filter(
              v => v.data.type !== 'multinominal' && v.data.type !== 'binominal'
            )
            .map(v => ({ code: v.data.code }))) ||
        [],
      filters: model?.query.filters || '',
      filterVariables:
        (d3Model.filters &&
          d3Model.filters.map(v => ({ code: v.data.code }))) ||
        [],
      groupings:
        (d3Model.covariables &&
          d3Model.covariables
            .filter(
              v => v.data.type === 'multinominal' || v.data.type === 'binominal'
            )
            .map(v => ({ code: v.data.code }))) ||
        [],
      trainingDatasets: datasets,
      variables:
        (d3Model.variables &&
          d3Model.variables.map(v => ({ code: v.data.code }))) ||
        [],
      pathology: (model && model.query && model.query.pathology) || ''
    };

    if (model) {
      model.query = query;

      return model;
    } else {
      const draft: ModelResponse = {
        query,
        title: 'untitled'
      };

      return draft;
    }
  };
}

export default Model;
