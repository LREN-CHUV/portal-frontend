// tslint:disable:no-console
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { Container } from "unstated";
import { IModelContainer } from "../../types";

dotenv.config();

class ModelContainer extends Container<IModelContainer> {
  public state = {
    error: undefined,
    loading: true,
    model: undefined
  };

  private baseUrl = `${process.env.REACT_APP_BACKEND_URL}/models`;

  public load = async (slug: string) => {
    await this.setState({ loading: true });
    try {
      const data = await fetch(`${this.baseUrl}/${slug}`);
      const json = await data.json();
      if (json.error) {
        return await this.setState(state => ({
          error: json.error,
          loading: false
        }));
      }

      return await this.setState(state => ({ loading: false, model: json }));
    } catch (error) {
      console.log(error);
      return await this.setState(state => ({
        error: error.message,
        loading: false
      }));
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
      return await this.setState(state => ({ loading: false, model: json }));
    } catch (error) {
      return await this.setState(state => ({
        error: error.message,
        loading: false
      }));
      console.log(error);
    }
  };
}

export default ModelContainer;
