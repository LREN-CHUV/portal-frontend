// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";
import { config } from "../../tests/mocks";
import { IExperimentListContainer } from "../../types";
import ParseExperiment from "./ParseExperiment";
dotenv.config();

export interface IResult {
  uuid: string;
  name: string;
}

class ExperimentListContainer extends Container<IExperimentListContainer> {
  public state = {
    error: undefined,
    experiments: undefined,
    loading: true
  };

  private baseUrl = `${process.env.REACT_APP_BACKEND_URL}/experiments`;

  public load = async () => {
    await this.setState({ loading: true });
    try {
      const data = await request.get(`${this.baseUrl}?mine=true`, config);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error,
          loading: false
        });
      }

      return await this.setState({
        experiments: json.map((j: IExperimentResult) =>
          new ParseExperiment(j).parse()
        ),
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

export default ExperimentListContainer;
