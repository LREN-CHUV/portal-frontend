// tslint:disable:no-console
import * as dotenv from 'dotenv';
import fetch from "node-fetch";
import { Container } from "unstated";

dotenv.config()

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
    const items = await fetch(`${process.env.REACT_APP_BACKEND_URL}/experiments?mine=true`).then(res =>
      res.json()
    );

    return await this.setState(state => ({ items }));
  };
}

export default ExperimentsContainer;
