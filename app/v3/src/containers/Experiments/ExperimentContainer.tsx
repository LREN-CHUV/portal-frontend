// tslint:disable:no-console
import fetch from "node-fetch";
import { Container } from "unstated";

const BACKEND_URL = "http://155.105.202.23:8080/services";

export interface IExperimentResult {
  error?: string;
  experiment: any;
  loading: boolean;
}

class ExperimentContainer extends Container<IExperimentResult> {
  public state = {
    error: undefined,
    experiment: { name: '' },
    loading: true,
    
  };

  public load = async (uuid: string) => {
    this.setState({ loading: true });
    try {
      const data = await fetch(`${BACKEND_URL}/experiments/${uuid}`);
      const json = await data.json();
      this.setState(state => ({ experiment: json, loading: false }));
    } catch (error) {
      this.setState(state => ({ loading: false, error: error.message }));
      console.log(error);
    }
  };
}

export default ExperimentContainer;
