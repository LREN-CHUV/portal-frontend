// tslint:disable:no-console
import fetch from "node-fetch";
import { Container } from "unstated";

const BACKEND_URL = "http://155.105.202.23:8080/services";

export interface IExperimentResult {
  name: string;
}

class ExperimentContainer extends Container<IExperimentResult> {
  public state = { name: "My Experiment" };
  public load = async (uuid: string) => {
    const json = await fetch(`${BACKEND_URL}/experiments/${uuid}`).then(res =>
      res.json()
    );

    return await this.setState(state => ({ ...json }));
  };
}

export default ExperimentContainer;
