import request from 'request-promise-native';
import stringHash from 'string-hash';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { MIME_TYPES } from '../constants';
import { VariableDatum } from '../Explore/d3Hierarchy';
import { Algorithm, Parameter, VariableEntity } from './Core';

interface Response {
  error: string | any | undefined;
  data: any | undefined;
}

export interface MiningResponseShape {
  data?: any;
  error?: string;
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
  grouping?: VariableEntity[];
  covariables?: VariableEntity[];
  datasets: VariableEntity[];
  filters: string;
}

export interface MiningState {
  error?: string;
  summaryStatistics?: MiningResponseShape[];
  heatmaps?: MiningResponseShape[];
  histograms?: MiningResponseShape;
}

//
class Mining extends Container<MiningState> {
  /*
    "data": [{ x: n }]
    "data": { "data": [{ x: n }] }
    "data": [{ "data": [{ x: n }] }]
  */
  public static normalizeHeatmapData = (
    heatmap: MiningResponseShape
  ): MiningResponseShape[] => {
    if (Array.isArray(heatmap.data)) {
      const isDataNested = heatmap.data.map(d => d.data).includes(true);
      if (isDataNested) {
        return heatmap.data.map(d => ({
          ...heatmap,
          data: d.data
        }));
      } else {
        return [heatmap];
      }
    } else {
      const data = heatmap.data && heatmap.data.data;
      return [
        {
          ...heatmap,
          data
        }
      ];
    }
  };
  public state: MiningState;

  private cachedSummaryStatistics: any = {};
  private options: request.Options;
  private backendURL: string;

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

  public oneHistogram = async (parameters: Parameter[]): Promise<Response> => {
    try {
      const data = await request({
        body: JSON.stringify(parameters),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/mining/exareme`
      });

      const jsonString = await JSON.parse(data);

      // FIXME: in exareme, return type should be json
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

  public exaremeHistograms = async ({
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
          error: 'Please select a dataset',
          loading: false
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

    const dependentsVariables = [
      '',
      'gender',
      'agegroup',
      'alzheimerbroadcategory'
    ].filter(v => x.code !== v);

    const type = x.type || 'real';
    if (type !== 'polynominal' && type !== 'binominal') {
      parameters.push({
        name: 'bins',
        value: '20'
      });
    }

    const nextParameters = dependentsVariables.map(v => [
      ...parameters,
      { name: 'y', value: v }
    ]);

    const promises = await Promise.all(nextParameters.map(this.oneHistogram));

    if (promises.map(p => p.error).some(p => p !== undefined)) {
      return this.setState({
        histograms: {
          data: undefined,
          error: promises.map(p =>
            typeof p.error === 'object' ? p.error && p.error.message : p.error
          )[0],
          loading: false
        }
      });
    }

    this.setState({
      histograms: {
        data: promises.map((p, i) => ({
          highchart: p.data.result.find(
            (d: any) => d.type === MIME_TYPES.HIGHCHARTS
          ),
          label: i === 0 ? x.label : dependentsVariables[i]
        })),
        error: undefined,
        loading: false
      }
    });
  };

  public histograms = async ({
    payload
  }: {
    payload: {
      datasets: VariableEntity[];
      variables: VariableEntity[];
    };
  }): Promise<any> => {
    await this.setState({
      histograms: { loading: true, error: undefined, data: undefined }
    });

    const nextPayload = {
      ...payload,
      algorithm: {
        code: 'histograms',
        name: 'Histograms',
        parameters: [],
        validation: false
      },
      covariables: [],
      filters: '',
      grouping: [
        { code: 'dataset' },
        { code: 'gender' },
        { code: 'agegroup' },
        { code: 'alzheimerbroadcategory' }
      ]
    };
    const response = await this.fetchOne({ payload: nextPayload });
    if (response.error) {
      return await this.setState({
        histograms: { loading: false, error: response.error, data: undefined }
      });
    }

    return await this.setState({
      histograms: { loading: false, error: undefined, data: response.data }
    });
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
