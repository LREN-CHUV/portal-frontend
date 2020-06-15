import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { HISTOGRAMS_STORAGE_KEY } from '../constants';
import { VariableDatum } from '../Explore/d3Hierarchy';
import { Algorithm, Parameter, VariableEntity } from './Core';
import { ERRORS_OUTPUT, MIME_TYPES } from '../constants';

export interface MiningResponse {
  data?: any;
  type?: string;
  error?: string;
  loading?: boolean;
  warning?: string;
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
  summaryStatistics?: MiningResponse[];
  histograms?: MiningResponse;
  refetchAlgorithms?: number;
}

//
class Mining extends Container<MiningState> {
  public state: MiningState;

  private options: request.Options;
  private backendURL: string;
  private requests: request.RequestPromise<any>[] = [];

  constructor(config: any) {
    super();
    this.state = {
      histograms: undefined,
      summaryStatistics: undefined
    };
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public clear = () => {
    return this.setState((prevState: any) => ({
      error: undefined,
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

  public setGroupingForPathology = (
    pathology: string,
    choosenVariables: HistogramVariable
  ): void => {
    const existing = this.choosenHistogramVariables();

    localStorage.setItem(
      HISTOGRAMS_STORAGE_KEY,
      JSON.stringify({
        ...existing,
        [pathology]: choosenVariables
      })
    );
  };

  public groupingForPathology = (pathology: string): HistogramVariable => {
    const existing = this.choosenHistogramVariables()[pathology] || {};

    return existing;
  };

  // TODO use context
  // used to trigger a fetch when local
  public refetchAlgorithms = (): void => {
    this.setState({ refetchAlgorithms: Math.random() });
  };
  public multipleHistograms = async ({
    y,
    datasets,
    pathology
  }: {
    y: VariableDatum;
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
        label: 'dataset',
        value: datasets.map(d => d.code).toString()
      },
      {
        name: 'y',
        label: 'y',
        value: y.code
      },
      {
        name: 'pathology',
        label: 'pathology',
        value: pathology
      }
    ];

    const choosenHistogramVariablesByPathology = this.groupingForPathology(
      pathology
    );

    const xVariables = Object.values(choosenHistogramVariablesByPathology)
      .map((v: VariableEntity) => v.code)
      .filter(v => y.code !== v);

    const type = y.type || 'real';
    if (type !== 'multinominal' && type !== 'binominal') {
      parameters.push({
        name: 'bins',
        label: 'bins',
        value: JSON.stringify({ [y.code]: 20 })
      });
    }

    if (xVariables.length > 0) {
      parameters.push({
        name: 'x',
        label: 'x',
        value: xVariables.toString()
      });
    }

    this.abortMiningRequests();

    try {
      const r = request({
        body: JSON.stringify(parameters),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining/histograms`
      });

      this.requests.push(r);
      const data = await r;
      const jsonString = await JSON.parse(data);

      // FIXME: in exareme, or backend API ? return type should be json
      const json = await JSON.parse(jsonString);

      const error = json.result.find((d: any) =>
        ERRORS_OUTPUT.includes(d.type)
      );

      if (error) {
        return this.setState({
          histograms: {
            data: undefined,
            error: error.data,
            loading: false
          }
        });
      }

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

  public descriptiveStatistics = async ({
    payload
  }: {
    payload: MiningPayload;
  }): Promise<any> => {
    const y = [
      ...payload.variables,
      ...payload.covariables,
      ...payload.grouping
    ].map(v => v.code);

    if (y?.length === 0) {
      return;
    }

    const parameters: Parameter[] = [
      {
        name: 'dataset',
        label: 'dataset',
        value: payload.datasets.map(v => v.code).toString()
      },
      {
        name: 'y',
        label: 'y',
        value: y.toString()
      },
      {
        name: 'filter',
        label: 'filter',
        value: payload.filters
      },
      {
        name: 'pathology',
        label: 'pathology',
        value: payload.pathology
      }
    ];

    this.abortMiningRequests();

    try {
      const r = request({
        body: JSON.stringify(parameters),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining/descriptive_stats`
      });
      this.requests.push(r);
      const data = await r;
      const jsonString = await JSON.parse(data);
      const json = await JSON.parse(jsonString);

      if (json && json.error) {
        this.setState({ error: json.error, summaryStatistics: undefined });
      }

      const summaryStatistics = json.result.filter((r: any) =>
        [MIME_TYPES.JSON, ...ERRORS_OUTPUT].includes(r.type)
      );

      this.setState({ error: undefined, summaryStatistics });
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message, summaryStatistics: undefined });
    }
  };

  private choosenHistogramVariables = (): {
    [key: string]: HistogramVariable;
  } => {
    const choosenHistogramVariablesByPathologyString = localStorage.getItem(
      HISTOGRAMS_STORAGE_KEY
    );

    const existing = choosenHistogramVariablesByPathologyString
      ? JSON.parse(choosenHistogramVariablesByPathologyString)
      : {};

    return existing;
  };
}

export default Mining;
