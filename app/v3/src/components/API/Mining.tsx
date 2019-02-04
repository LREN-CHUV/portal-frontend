import { backendURL } from "@app/components/API";
import { MIP } from "@app/types";
import request from "request-promise-native";
import { Container } from "unstated";

class Mining extends Container<MIP.Store.IMiningState> {
  public state: MIP.Store.IMiningState = {
    heatmap: undefined,
    loadingMinings: false,
    minings: []
  };
  public loaded = this.state.minings !== undefined;

  private cachedMinings: any[] = [];
  private requestedMinings: any = new Set();
  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${backendURL}`;
  }

  public clear = () => {
    this.cachedMinings = [];
    this.requestedMinings.clear();
    return this.setState((prevState: any) => ({
      error: undefined,
      heatmap: undefined,
      loadingMinings: false,
      minings: undefined
    }));
  };

  public create = async ({
    payload
  }: {
    payload: MIP.API.IMiningPayload;
  }): Promise<MIP.Store.IMiningResponseShape> => {
    try {
      const response = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "POST",
        uri: `${this.baseUrl}/mining`
      });

      const data = JSON.parse(response).data;

      return { data, error: undefined };
    } catch (error) {
      return { data: undefined, error: error.message };
    }
  };

  public heatmap = async ({
    payload
  }: {
    payload: MIP.API.IMiningPayload;
  }): Promise<any> => {
    // FIXME: return type should be MIP.Store.IMiningState
    await this.setState({ heatmap: { data: undefined, error: undefined } });
    const heatmap = await this.create({
      payload: {
        algorithm: {
          code: "correlationHeatmap",
          name: "Correlation heatmap",
          parameters: [],
          validation: false
        },
        ...payload
      }
    });

    return await this.setState({ heatmap });
  };

  public createAll = async ({
    payload
  }: {
    payload: MIP.API.IMiningPayload;
  }) => {
    const selectedDatasets: string[] = payload.datasets.map(d => d.code) || [];
    const selectedMinings = this.cachedMinings.filter(
      (mining: any) => selectedDatasets.indexOf(mining.dataset.code) > -1
    );

    this.setState({ minings: selectedMinings });

    // Filter non fetched datasets
    const payloads = payload.datasets
      .filter(
        dataset =>
          Array.from(this.requestedMinings).indexOf(dataset.code) === -1
      )
      .map(dataset => ({
        algorithm: {
          code: "statisticsSummary",
          name: "statisticsSummary",
          parameters: [],
          validation: false
        },
        ...payload,
        datasets: [dataset]
      }));

    selectedDatasets.map(s => this.requestedMinings.add(s));

    // We have to fetch for each dataset, otherwise values are aggregated
    payloads.map(async pl => {
      this.setState({
        loadingMinings: true
      });
      try {
        const data = await request({
          body: JSON.stringify(pl),
          headers: {
            ...this.options.headers,
            "Content-Type": "application/json;charset=UTF-8"
          },
          method: "POST",
          uri: `${this.baseUrl}/mining`
        });

        const json = JSON.parse(data).data;
        const dataset = pl.datasets && pl.datasets.length > 0 && pl.datasets[0];
        const augmentedData = json.data.map((d: any) => ({
          dataset,
          ...d
        }));
        const augmentedJson = {
          ...json,
          data: augmentedData,
          dataset
        };

        this.cachedMinings.push(augmentedJson);

        return await this.setState((prevState: any) => ({
          error: prevState.error,
          loadingMinings: false,
          minings: prevState.minings
            ? [...prevState.minings, augmentedJson]
            : [augmentedJson]
        }));
      } catch (error) {
        return await this.setState((prevState: any) => ({
          error: error.message,
          loadingMinings: false,
          minings: prevState.minings
        }));
      }
    });
  };
}

export default Mining;
