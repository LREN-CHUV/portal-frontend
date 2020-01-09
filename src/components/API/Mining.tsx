import request from 'request-promise-native';
import stringHash from 'string-hash';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { VariableDatum } from '../Explore/d3Hierarchy';
import { Algorithm, Parameter, VariableEntity } from './Core';

interface Response {
  error: string | any | undefined;
  data: any | undefined;
}

export interface MiningResponseShape {
  data?: any;
  error?: string;
  warning?: string;
  dataset?: VariableEntity;
  loading?: boolean;
}

export interface IMiningResponse {
  jobId: string;
  node: string;
  function: string;
  shape: string;
  timestamp: string;
  data: any;
}

export interface MiningPayload {
  algorithm?: Algorithm;
  variables: VariableEntity[];
  grouping: VariableEntity[];
  covariables: VariableEntity[];
  datasets: VariableEntity[];
  filters: string;
  pathology?: string;
}

export interface HistogramVariable {
  [key: string]: VariableEntity;
}

export interface MiningState {
  error?: string;
  summaryStatistics?: MiningResponseShape[];
  heatmaps?: MiningResponseShape[];
  histograms?: MiningResponseShape;
  refetchAlgorithms?: number;
}

//
class Mining extends Container<MiningState> {
  public state: MiningState;

  private cachedSummaryStatistics: any = {};
  private options: request.Options;
  private backendURL: string;
  private requests: request.RequestPromise<any>[] = [];

  constructor(config: any) {
    super();
    this.state = {
      heatmaps: undefined,
      histograms: undefined,
      summaryStatistics: undefined
    };
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public clear = () => {
    this.cachedSummaryStatistics = {};
    return this.setState((prevState: any) => ({
      error: undefined,
      heatmaps: undefined,
      histograms: undefined,
      summaryStatistics: undefined
    }));
  };

  public abortMiningRequests = (): void => {
    try {
      this.requests.forEach(r => r.abort && r.abort());
      this.requests = [];
    } finally {
      //
    }
  };

  public refetchAlgorithms = () => {
    this.setState({ refetchAlgorithms: Math.random() });
  };

  public multipleHistograms = async ({
    x,
    datasets,
    pathology
  }: {
    x: VariableDatum;
    datasets: VariableEntity[];
    pathology: string;
  }): Promise<void> => {
    if (datasets.length === 0) {
      return await this.setState({
        histograms: {
          data: undefined,
          loading: false,
          warning: 'Please select a dataset'
        }
      });
    }

    await this.setState({
      histograms: {
        data: undefined,
        error: undefined,
        loading: true
      }
    });

    const parameters: Parameter[] = [
      {
        name: 'dataset',
        value: datasets.map(d => d.code).toString()
      },
      {
        name: 'x',
        value: x.code
      },
      {
        name: 'pathology',
        value: pathology
      }
    ];

    const choosenHistogramVariablesString = localStorage.getItem(
      'choosenHistogramVariables'
    );

    const choosenHistogramVariables: HistogramVariable = choosenHistogramVariablesString
      ? JSON.parse(choosenHistogramVariablesString)
      : {};

    const dependentsVariables = Object.values(choosenHistogramVariables)
      .map((v: VariableEntity) => v.code)
      .filter(v => x.code !== v);

    const type = x.type || 'real';
    if (type !== 'polynominal' && type !== 'binominal') {
      parameters.push({
        name: 'bins',
        value: JSON.stringify({ [x.code]: 20 })
      });
    }

    parameters.push({
      name: 'y',
      value: dependentsVariables.toString()
    });

    this.abortMiningRequests();

    try {
      const r = request({
        body: JSON.stringify(parameters),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining/exareme/MULTIPLE_HISTOGRAMS`
      });

      this.requests.push(r);
      const data = await r;
      const jsonString = await JSON.parse(data);

      // FIXME: in exareme, or backend API ? return type should be json
      const json = await JSON.parse(jsonString);
      this.setState({
        histograms: {
          data: json.result.map((p: any) => ({
            highchart: p
            // label: i === 0 ? x.label : dependentsVariables[i]
          })),
          error: undefined,
          loading: false
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // FIXME: cache doesn't work for exareme.
  public descriptiveStatisticsByDataset = async ({
    payload
  }: {
    payload: MiningPayload;
  }): Promise<any> => {
    const hashKey = stringHash(
      `${payload.variables}${payload.covariables}${payload.grouping}${payload.filters}`
    );
    const queries = payload.datasets.map(dataset => {
      const code = dataset.code;

      const response =
        this.cachedSummaryStatistics[code] &&
        this.cachedSummaryStatistics[code].hashKey === hashKey;

      if (!response) {
        this.cachedSummaryStatistics[code] = {
          data: undefined,
          dataset,
          error: undefined,
          hashKey
        };
      }

      return this.cachedSummaryStatistics[code];
    });

    this.setState({ summaryStatistics: queries });
    this.abortMiningRequests();

    queries
      .filter(q => !q.data)
      .forEach(async q => {
        const parameters: Parameter[] = [
          {
            name: 'dataset',
            value: q.dataset.code
          },
          {
            name: 'x',
            value: [
              ...payload.variables,
              ...payload.covariables,
              ...payload.grouping
            ]
              .map(v => v.code)
              .toString()
          },
          {
            name: 'filter',
            value: payload.filters
          },
          {
            name: 'pathology',
            value: payload.pathology
          }
        ];

        const mining = await this.fetchExaremeStats(parameters);
        if (mining && !mining.data) {
          return this.setState({ error: 'No data available. Please retry.' });
        }
        const error = mining.data.result.find(
          (d: any) =>
            d.type === 'text/plain+warning' || d.type === 'text/plain+error'
        );
        // console.log(error);
        this.cachedSummaryStatistics[q.dataset.code] = {
          data: mining.data.result
            .map((d: any) => d.data)
            .map((d: any) => d.data)
            .flat(),
          dataset: q.dataset,
          error: error ? error.data : undefined
        };

        const summaryStatistics = payload.datasets.map(
          dataset => this.cachedSummaryStatistics[dataset.code]
        );
        this.setState({ summaryStatistics });
      });
  };

  public fetchExaremeStats = async (
    parameters: Parameter[]
  ): Promise<Response> => {
    try {
      const r = request({
        body: JSON.stringify(parameters),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining/exareme-stats`
      });
      this.requests.push(r);
      const data = await r;
      const jsonString = await JSON.parse(data);

      // FIXME: in exareme? backend API ? , return type should be json
      const json = await JSON.parse(jsonString);

      if (json && json.error) {
        return { error: json.error, data: undefined };
      }

      return { error: undefined, data: json };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };

  // fetch for each dataset, otherwise values are aggregated for all datasets
  public summaryStatisticsByDataset = async ({
    payload
  }: {
    payload: MiningPayload;
  }): Promise<any> => {
    const hashKey = stringHash(
      `${payload.variables}${payload.covariables}${payload.grouping}${payload.filters}`
    );
    const queries = payload.datasets.map(dataset => {
      const code = dataset.code;

      const response =
        this.cachedSummaryStatistics[code] &&
        this.cachedSummaryStatistics[code].hashKey === hashKey;

      if (!response) {
        this.cachedSummaryStatistics[code] = {
          data: undefined,
          dataset,
          error: undefined,
          hashKey
        };
      }

      return this.cachedSummaryStatistics[code];
    });

    this.setState({ summaryStatistics: queries });

    queries
      .filter(q => !q.data)
      .forEach(async q => {
        const pl = {
          algorithm: {
            code: 'statisticsSummary',
            name: 'statisticsSummary',
            parameters: [],
            validation: false
          },
          ...payload,
          datasets: [q.dataset]
        };
        const mining = await this.fetchOne({ payload: pl });
        this.cachedSummaryStatistics[q.dataset.code] = {
          data: mining.data,
          dataset: q.dataset,
          error: mining.error,
          hashKey
        };

        const summaryStatistics = payload.datasets.map(
          dataset => this.cachedSummaryStatistics[dataset.code]
        );
        this.setState({ summaryStatistics });
      });
  };

  private fetchOne = async ({
    payload
  }: {
    payload: MiningPayload;
  }): Promise<MiningResponseShape> => {
    const copyOfDataset = payload.datasets && [...payload.datasets];

    try {
      const response = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining`
      });

      const data = JSON.parse(response);

      return {
        data: data && data.data,
        dataset: copyOfDataset.pop(),
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        dataset: copyOfDataset.pop(),
        error: error.message
      };
    }
  };
}

export default Mining;
