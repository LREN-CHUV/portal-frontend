import request from 'request-promise-native';
import stringHash from 'string-hash';
import { Container } from 'unstated';
import { MIP } from '../../types';
import { backendURL } from '../API';

//
class Mining extends Container<MIP.Store.IMiningState> {
  /*
    "data": [{ x: n }]   
    "data": { "data": [{ x: n }] }   
    "data": [{ "data": [{ x: n }] }] 
  */
  public static normalizeHeatmapData = (
    heatmap: MIP.Store.IMiningResponseShape
  ): MIP.Store.IMiningResponseShape[] => {
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
  public state: MIP.Store.IMiningState;

  private cachedSummaryStatistics: any = {};
  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.state = {
      heatmaps: undefined,
      histograms: undefined,
      summaryStatistics: undefined
    };
    this.options = config.options;
    this.baseUrl = backendURL;
  }

  public clear = () => {
    this.cachedSummaryStatistics = {};
    return this.setState((prevState: any) => ({
      error: undefined,
      heatmaps: undefined,
      summaryStatistics: undefined
    }));
  };

  public heatmaps = async ({
    payload
  }: {
    payload: MIP.API.IMiningPayload;
  }): Promise<any> => {
    await this.setState({
      heatmaps: [
        {
          data: undefined,
          dataset: undefined,
          error: undefined
        }
      ]
    });
    payload = {
      ...payload,
      algorithm: {
        code: 'correlationHeatmap',
        name: 'Correlation heatmap',
        parameters: [],
        validation: false
      }
    };
    const heatmap = await this.fetchOne({ payload });
    return await this.setState({
      heatmaps: Mining.normalizeHeatmapData(heatmap)
    });
  };

  public histograms = async ({
    payload
  }: {
    payload: {
      datasets: MIP.API.IVariableEntity[];
      variables: MIP.API.IVariableEntity[];
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
    payload: MIP.API.IMiningPayload;
  }): Promise<any> => {
    const hashKey = stringHash(`${payload.variables}${payload.filters}`);
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
    payload: MIP.API.IMiningPayload;
  }): Promise<MIP.Store.IMiningResponseShape> => {
    const copyOfDataset = payload.datasets && [...payload.datasets];

    try {
      const response = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.baseUrl}/mining`
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
