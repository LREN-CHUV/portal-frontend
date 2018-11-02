// tslint:disable:no-console
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";
import { IModelContainer, IModelResult } from "../../types";

dotenv.config();

class ModelContainer extends Container<IModelContainer> {
  public state: IModelContainer = {
    error: undefined,
    model: undefined
  };

  private options: any;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}/models`;
  }

  public load = async (slug: string) => {
    try {
      const data = await request.get(`${this.baseUrl}/${slug}`, this.options);
      const json: IModelResult = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        model: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public create = async (params: any) => {
    try {
      const data = await request({
        body: JSON.stringify(params),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json"
        },
        method: "POST",
        uri: `${this.baseUrl}`
      });
      const json = await JSON.parse(data);
      return await this.setState({
        error: undefined,
        model: json
      });
    } catch (error) {
      // console.log(error);
      return await this.setState({
        error: error.message
      });
    }
  };

  public update = async (model: any) => {
    try {
      await request({
        body: JSON.stringify(model),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json"
        },
        method: "PUT",
        uri: `${this.baseUrl}/${model.slug}`
      });
      return await this.setState({
        error: undefined,
        model
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  }
}

export default ModelContainer;
