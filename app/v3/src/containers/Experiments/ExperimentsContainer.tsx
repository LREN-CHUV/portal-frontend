// tslint:disable:no-console
import fetch from "node-fetch";
import { Container } from "unstated";

const BACKEND_URL = "http://155.105.202.23:8080/services";

export interface IResult {
    uuid: string;
    name: string;
} 

export interface IExperimentsResult {
  items: IResult[] | undefined;
}

class ExperimentsContainer extends Container<IExperimentsResult> {
  public state = { items: [{ uuid: "", name: ""}] };
  public load = async () => {
    const items = await fetch(`${BACKEND_URL}/experiments?mine=true`).then(res =>
      res.json()
    );

    return await this.setState(state => ({ items }));
  };
}

export default ExperimentsContainer;
