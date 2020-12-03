import axios, { AxiosRequestConfig } from 'axios';
import { Container } from 'unstated';

import { backendURL } from '../API';
import {
  Algorithm,
  AlgorithmParameter,
  AlgorithmParameterRequest
} from '../API/Core';
import { ModelResponse, Query } from '../API/Model';
import { MIME_TYPES } from '../constants';

interface IUUID {
  uuid: string;
}

export interface ExperimentPayload {
  algorithms: Algorithm[];
  model: string;
  name: string;
  label: string;
}

export type experimentStatus = 'error' | 'success';

export interface ExperimentParameter {
  name: string;
  label: string;
  value: string;
}

export interface AlgorithmDetail {
  name: string;
  desc?: string;
  label?: string;
  type: string;
  parameters: ExperimentParameter[];
}

export interface Result {
  type: MIME_TYPES;
  data: any;
}

export interface IExperiment {
  uuid: string;
  name: string;
  createdBy: string;
  created: string;
  finisehd: string;
  shared: boolean;
  viewed: boolean;
  status: experimentStatus;
  algorithm: AlgorithmDetail;

  algorithmDetails?: AlgorithmDetail;
  results?: Result[];
}

export interface IExperimentList {
  experiments: IExperiment[];
  totalPages: number;
  currentPage: number;
  totalExperiments: number;
}

export interface State {
  error?: string;
  experiment?: IExperiment;
  experimentList?: IExperimentList;
}

class Experiment extends Container<State> {
  state: State = {};

  private options: AxiosRequestConfig;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}/experiments`;
  }

  makeParameters = (
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
        name: p.name,
        label: p.label,
        value
      };
    });

  loaded = (): boolean =>
    this.state.experiment !== undefined &&
    this.state.experiment.results !== undefined;

  one = async ({ uuid }: IUUID): Promise<void> => {
    try {
      // mark status and refresh the list
      /*       if (
        this.state.experimentList?.experiments.find(e => e.uuid === uuid)
      ) {
        await axios.get(`${this.baseUrl}/${uuid}/markAsViewed`, this.options);
        await this.setState(previousState => ({
          experimentList: previousState.experimentList?.map(e => ({
            ...e,
            resultsViewed: e.uuid === uuid ? true : e
          }))
        }));
      }

      const response = await axios.get(`${this.baseUrl}/${uuid}`, this.options);
      const experiment = response.data;

      return await this.setState({
        error: undefined,
        experiment
      }); */
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  list = async (): Promise<void> => {
    try {
      const response = await axios.get(`${this.baseUrl}`, this.options);

      const experimentList: IExperimentList = response.data;

      return await this.setState({
        error: undefined,
        experimentList
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  create = async ({
    payload
  }: {
    payload: ExperimentPayload;
  }): Promise<void> => {
    const url = `${this.baseUrl}/runAlgorithm`;

    try {
      const response = await axios({
        data: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        url
      });
      const experiment = response.data;

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

  markAsViewed = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsViewed');

  markAsShared = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsShared');

  markAsUnshared = async ({ uuid }: IUUID): Promise<void> =>
    this.markExperiment(uuid, 'markAsUnshared');

  private markExperiment = async (
    uuid: string,
    action: string
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${uuid}/${action}`,
        this.options
      );
      const experiment = response.data;

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
