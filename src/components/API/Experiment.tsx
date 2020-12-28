import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { Algorithm, AlgorithmParameter } from '../API/Core';
import { ModelResponse } from '../API/Model';
import { MIME_TYPES, ALGORITHMS_OUTPUT } from '../constants';

interface IUUID {
  uuid: string;
}

export interface ExperimentPayload {
  algorithms: Algorithm[];
  model: string;
  name: string;
  label: string;
}

export type ExperimentStatus = 'error' | 'pending' | 'success';
export type ParameterName =
  | 'x'
  | 'y'
  | 'dataset'
  | 'pathology'
  | 'filter'
  | 'bins'
  | 'referencevalues'
  | 'encodingparameter'
  | 'iterations_max_number'
  | 'sstype'
  | 'outputformat'
  | 'standardize'
  | 'coding'
  | 'kfold'
  | 'alpha'
  | 'k'
  | 'e'
  | 'xlevels'
  | 'hypothesis'
  | 'effectsize'
  | 'ci'
  | 'meandiff'
  | 'testvalue'
  | 'dx'
  | 'c2_feature_selection_method'
  | 'c2_num_clusters_method'
  | 'c2_num_clusters'
  | 'c2_clustering_method'
  | 'c3_feature_selection_method'
  | 'c3_classification_method'
  | 'devel'
  | 'max_deg'
  | 'confLevels'
  | 'thres'
  | 'num_points'
  | 'max_depth'
  | 'outcome_pos'
  | 'outcome_neg'
  | 'max_age'
  | 'positive_level'
  | 'negative_level'

export interface ExperimentParameter {
  name: ParameterName;
  label?: string;
  value: string | number;
}

export interface Result {
  type: MIME_TYPES;
  data: any;
}

export interface IExperimentError {
  status: ExperimentStatus;
  result?: Result[];
}

export interface IExperiment extends IExperimentError {
  uuid: string;
  name: string;
  createdBy: string;
  created: string;
  finisehd: string;
  shared?: boolean;
  viewed: boolean;
  algorithm: {
    name: string;
    desc?: string;
    label?: string;
    type: string;
    parameters: ExperimentParameter[];
  };
}

export interface IExperimentList {
  experiments: IExperiment[];
  totalPages: number;
  currentPage: number;
  totalExperiments: number;
}

type Order = 'created';
export interface ExperimentListQueryParameters {
  algorithm?: string;
  descending?: boolean;
  includeShared?: boolean;
  name?: string;
  orderBy?: Order;
  page?: number;
  shared?: boolean;
  size?: number;
  viewed?: boolean;
}

export type HandleQueryParameters = ({
  ...params
}: ExperimentListQueryParameters) => void;
export interface State {
  experiment: IExperiment | IExperimentError;
  experimentList?: IExperimentList;
  experimentListError?: string;
  experimentListQueryParameters: ExperimentListQueryParameters;
  parameterExperimentList?: IExperimentList;
  parameterExperimentListError?: string;
  parameterExperiment?: IExperiment | IExperimentError;
  parameterExperimentListQueryParameters: ExperimentListQueryParameters;
}

class Experiment extends Container<State> {
  state: State = {
    experiment: { status: 'pending' },
    experimentListQueryParameters: { page: 0 },
    parameterExperimentListQueryParameters: { page: 0 }
  };

  private options: AxiosRequestConfig;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/experiments`;
  }

  setParameterExperiment = (parameterExperiment?: IExperiment): void => {
    this.setState({ parameterExperiment });
  };

  // Iexperiment Type Guards
  isExperiment = (
    e?: IExperiment | IExperimentError
  ): IExperiment | undefined =>
    e === undefined || (e as IExperiment).uuid !== undefined
      ? (e as IExperiment)
      : undefined;

  filterResponse = (
    response: AxiosResponse<any>
  ): { experiment: IExperiment | IExperimentError } => {
    if (response.status >= 500) {
      return {
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.ERROR, data: response.data.message }]
        }
      };
    }

    if (response.status >= 400) {
      return {
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.WARNING, data: response.data.message }]
        }
      };
    }

    const experiment: IExperiment = response.data;

    if (experiment.status === 'error') {
      return {
        experiment: {
          status: 'error',
          result: [
            {
              type: MIME_TYPES.ERROR,
              data: 'An unknown error occured. Please retry in a moment'
            }
          ]
        }
      };
    }

    const result = experiment.result?.filter(e =>
      ALGORITHMS_OUTPUT.find(
        a => a.name === experiment.algorithm.name
      )?.types?.includes(e.type)
    );

    return {
      experiment: {
        ...experiment,
        result
      }
    };
  };

  get = async ({ uuid }: IUUID): Promise<void> => {
    try {
      const response = await Axios.get(`${this.baseUrl}/${uuid}`, this.options);

      return await this.setState(this.filterResponse(response));
    } catch (error) {
      console.log('error');
      return await this.setState({
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.ERROR, data: error.message }]
        }
      });
    }
  };

  /* Must keep the parameters as we are polling this list to retrieve updated status and new experiments,
  so the list must be refreshed with the same parameters otherwise the index (page, search) get reset */
  list = async ({
    ...params
  }: ExperimentListQueryParameters): Promise<void> => {
    const currentExperimentListQueryParameters = this.state
      .experimentListQueryParameters;

    const nextPage =
      params.page === 0
        ? 0
        : params.page === undefined
          ? currentExperimentListQueryParameters.page
          : params.page;

    // reset the page if search is on */
    const page = params?.name && params?.name?.length > 2 ? 0 : nextPage;

    const nextQueryParameters = {
      ...currentExperimentListQueryParameters,
      ...params,
      page
    };

    const nextParams = Object.entries(nextQueryParameters)
      .map(entry => `${entry[0]}=${entry[1]}&`)
      .join('');

    try {
      const response = await Axios.get(
        `${this.baseUrl}?${nextParams}`,
        this.options
      );

      const experimentList: IExperimentList = response.data;

      return await this.setState({
        experimentList,
        experimentListQueryParameters: nextQueryParameters
      });
    } catch (error) {
      return await this.setState({
        experimentListError: error.message
      });
    }
  };

  parameterList = async ({
    ...params
  }: ExperimentListQueryParameters): Promise<void> => {
    const currentExperimentListQueryParameters = this.state
      .parameterExperimentListQueryParameters;

    const nextPage =
      params.page === 0
        ? 0
        : params.page === undefined
          ? currentExperimentListQueryParameters.page
          : params.page;

    // reset the page if search is on */
    const page = params?.name && params?.name?.length > 2 ? 0 : nextPage;

    const nextQueryParameters = {
      ...currentExperimentListQueryParameters,
      ...params,
      page
    };

    const nextParams = Object.entries(nextQueryParameters)
      .map(entry => `${entry[0]}=${entry[1]}&`)
      .join('');

    try {
      const response = await Axios.get(
        `${this.baseUrl}?${nextParams}`,
        this.options
      );

      const parameterExperimentList: IExperimentList = response.data;

      return await this.setState(previousState => ({
        error: undefined,
        parameterExperimentList,
        parameterExperimentListQueryParameters: nextQueryParameters
      }));
    } catch (error) {
      return await this.setState({
        parameterExperimentListError: error.message
      });
    }
  };

  delete = async ({ uuid }: { uuid: string }): Promise<void> => {
    try {
      const response = await Axios({
        method: 'DELETE',
        headers: this.options.headers,
        url: `${this.baseUrl}/${uuid}`
      });

      await this.list({});

      return await this.setState(this.filterResponse(response));
    } catch (error) {
      return await this.setState({
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.ERROR, data: error.message }]
        }
      });
    }
  };

  update = async ({
    uuid,
    experiment
  }: {
    uuid: string;
    experiment: Partial<IExperiment>;
  }): Promise<void> => {
    try {
      const response = await Axios({
        method: 'PATCH',
        data: JSON.stringify(experiment),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        url: `${this.baseUrl}/${uuid}`
      });

      await this.list({});

      return await this.setState(this.filterResponse(response));
    } catch (error) {
      return await this.setState({
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.ERROR, data: error.message }]
        }
      });
    }
  };

  create = async ({
    experiment,
    transient = true
  }: {
    experiment: Partial<IExperiment>;
    transient?: boolean;
  }): Promise<void> => {
    try {
      const response = await Axios({
        method: 'POST',
        data: JSON.stringify(experiment),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        url: transient ? `${this.baseUrl}/transient` : `${this.baseUrl}`
      });

      return await this.setState(this.filterResponse(response));
    } catch (error) {
      return await this.setState({
        experiment: {
          status: 'error',
          result: [{ type: MIME_TYPES.ERROR, data: error.message }]
        }
      });
    }
  };

  markAsViewed = async ({ uuid }: IUUID): Promise<void> =>
    this.update({ uuid, experiment: { viewed: true } });

  markAsShared = async ({ uuid }: IUUID): Promise<void> =>
    this.update({ uuid, experiment: { shared: true } });

  markAsUnshared = async ({ uuid }: IUUID): Promise<void> =>
    this.update({ uuid, experiment: { shared: false } });

  makeParameters = (
    model: ModelResponse,
    selectedAlgorithm: Algorithm,
    parameters: AlgorithmParameter[]
  ): ExperimentParameter[] =>
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
            // FIXME: a+b doesn't work for those
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
          const isVector = selectedAlgorithm.label === 'T-Test Paired';
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
        name: p.name as ParameterName,
        label: p.label,
        value
      };
    });
}

export default Experiment;
