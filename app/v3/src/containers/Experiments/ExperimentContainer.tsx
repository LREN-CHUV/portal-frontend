// tslint:disable:no-console
import * as dotenv from 'dotenv';
import fetch from "node-fetch";
import { Container } from "unstated";

dotenv.config()

export interface IExperimentResult {
  error?: string;
  experiment: any;
  loading: boolean;
}

class ExperimentContainer extends Container<IExperimentResult> {
  public state = {
    error: undefined,
    experiment: { name: "" },
    loading: true
  };

  public load = async (uuid: string) => {
    this.setState({ loading: true });
    console.log(process.env.REACT_APP_BACKEND_URL)
    try {
      const data = await fetch(`${process.env.REACT_APP_BACKEND_URL}/experiments/${uuid}`);
      const json = await data.json();
      this.setState(state => ({ experiment: json, loading: false }));
    } catch (error) {
      this.setState(state => ({ loading: false, error: error.message }));
      console.log(error);
    }
  };
}

export default ExperimentContainer;
