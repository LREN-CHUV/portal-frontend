import { MIP } from "@app/types";
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

class Mining extends Container<MIP.Store.IMiningState> {
  public state: MIP.Store.IMiningState = {};

  public loaded =
    this.state.mining !== undefined;

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}`;
  }

  public create = async ({
    payload
  }: {
    payload: MIP.API.IExperimentMiningPayload;
  }) => {
    try {
      const data = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "POST",
        uri: `${this.baseUrl}/mining`
      });
      const json = await JSON.parse(data);
      return await this.setState({
        error: undefined,
        mining: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Mining;
