import { MIP } from "@app/types";
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

class Mining extends Container<MIP.Store.IMiningState> {
  public state: MIP.Store.IMiningState = {};

  public loaded = this.state.mining !== undefined;

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}`;
  }

  public createAll = async ({
    payload
  }: {
    payload: MIP.API.IExperimentMiningPayload;
  }) => {
    const payloads = payload.datasets.map(dataset => ({
      algorithm: {
        code: "statisticsSummary",
        name: "statisticsSummary",
        parameters: [],
        validation: false
      },
      ...payload,
      datasets: [dataset]
    }));

    try {
      const data = await Promise.all(
        payloads.map(pl =>
          request({
            body: JSON.stringify(pl),
            headers: {
              ...this.options.headers,
              "Content-Type": "application/json;charset=UTF-8"
            },
            method: "POST",
            uri: `${this.baseUrl}/mining`
          })
        )
      );

      return await this.setState({
        error: undefined,
        mining: data.map((d:any) => JSON.parse(d) )
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Mining;
