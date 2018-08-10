// tslint:disable:no-console
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { Container } from "unstated";
import { IExperimentContainer } from "../../types";

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
      const data = await fetch(`${this.baseUrl}/${uuid}`);
      const json = await data.json();
      return await this.setState(state => ({
        experiment: json,
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
  

  public create = async (params: any) => {
    await this.setState({ loading: true });
    try {
      const data = await fetch(this.baseUrl, {
        body: JSON.stringify(params),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const json = await data.json();
      return await this.setState(state => ({
        experiment: json,
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

export default ExperimentContainer;
