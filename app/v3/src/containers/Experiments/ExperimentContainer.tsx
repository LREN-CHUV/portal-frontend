// tslint:disable:no-console
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";
import { config } from "../../tests/mocks";
import { IExperimentContainer } from "../../types";
import ParseExperiment from "./ParseExperiment";

dotenv.config();

class ExperimentContainer extends Container<IExperimentContainer> {
  public state: IExperimentContainer = {
    error: undefined,
    experiment: undefined,
    loading: true
  };

  private baseUrl = `${process.env.REACT_APP_BACKEND_URL}/experiments`;

  public load = async (uuid: string) => {
    await this.setState({ loading: true });
    try {
      const data = await request.get(`${this.baseUrl}/${uuid}`, config);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error,
          loading: false
        });
      }
      return await this.setState({
        error: undefined,
        experiment:ParseExperiment.parse(json),
        loading: false
      });
    } catch (error) {
      console.log({ error });
      return await this.setState({
        error: error.message,
        loading: false
      });
    }
  };

  public create = async (params: any) => {
    await this.setState({ loading: true });

    try {
      const data = await request({
        body: JSON.stringify(params),
        headers: {
          ...config.headers,
          "Content-Type": "application/json"
        },
        method: "POST",
        uri: `${this.baseUrl}`
      });
      const json = await JSON.parse(data);
      return await this.setState({
        error: undefined,
        experiment: ParseExperiment.parse(json),
        loading: false
      });
    } catch (error) {
      console.log(error);
      return await this.setState({
        error: error.message,
        loading: false
      });
    }
  };
}

export default ExperimentContainer;
