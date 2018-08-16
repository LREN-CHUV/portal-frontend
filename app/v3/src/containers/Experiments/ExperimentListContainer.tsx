// tslint:disable:no-console
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { Container } from "unstated";
import { IExperimentListContainer } from "../../types";

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
      const data = await fetch(`${this.baseUrl}?mine=true`);
      const json = await data.json();
      if (json.error) {
        return await this.setState(state => ({
          error: json.error,
          loading: false
        }));
      }

      return await this.setState(state => ({
        experiments: json,
        loading: false
      }));
    } catch (error) {
      return await this.setState(state => ({
        error: error.message,
        loading: false
      }));
      console.log(error);
    }
  };
}

export default ExperimentListContainer;
