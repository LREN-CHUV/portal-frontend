// tslint:disable:no-console
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { Container } from "unstated";
import { IExperimentsContainer } from "../../types";

dotenv.config();

export interface IResult {
  uuid: string;
  name: string;
}

class ExperimentsContainer extends Container<IExperimentsContainer> {
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

export default ExperimentsContainer;
