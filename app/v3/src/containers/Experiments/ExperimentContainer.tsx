// tslint:disable:no-console
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { Container } from "unstated";
import { IExperimentContainer } from "../../types";

dotenv.config();

class ExperimentContainer extends Container<IExperimentContainer> {
  public state = {
    error: undefined,
    experiment: undefined,
    loading: true
  };

  public load = async (uuid: string) => {
    await this.setState({ loading: true });
    try {
      const data = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/experiments/${uuid}`
      );
      const json = await data.json();
      return await this.setState(state => ({ experiment: json, loading: false }));
    } catch (error) {
      return await this.setState(state => ({ loading: false, error: error.message }));
      console.log(error);
    }
  };

  // public create = async (params: any) => {
  //   this.setState(state => ({ experiment: { name: "tsne" }, loading: false }));
  // };
}

export default ExperimentContainer;
