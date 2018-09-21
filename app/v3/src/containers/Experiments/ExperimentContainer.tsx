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
    experiment: undefined
  };

  private baseUrl = `${process.env.REACT_APP_BACKEND_URL}/experiments`;

  public load = async (uuid: string) => {
    try {
      const data = await request.get(`${this.baseUrl}/${uuid}`, config);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = ParseExperiment.parse(json);
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

  public create = async (params: any) => {
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
      const experiment = ParseExperiment.parse(json);
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

  public markAsViewed = async (uuid: string) => {
    try {
      const data = await request.get(
        `${this.baseUrl}/${uuid}/markAsViewed`,
        config
      );
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }
      const experiment = ParseExperiment.parse(json);
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

export default ExperimentContainer;
