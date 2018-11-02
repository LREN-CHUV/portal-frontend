// tslint:disable:no-console
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

export interface IExploreContainer {
  error?: string;
  hierarchy?: any;
  variables?: any;
}


class ExploreContainer extends Container<IExploreContainer> {
  public state: IExploreContainer = {};

  private options: any;
  private baseUrl: string;
  // private groupBaseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}/variables`;
    // this.groupBaseUrl = `${config.baseUrl}/groups`;
  }

  public variables = async () => {
    try {
      const data = await request.get(`${this.baseUrl}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        variables: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public hierarchy = async () => {
    try {
      const data = await request.get(`${this.baseUrl}/hierarchy`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        hierarchy: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default ExploreContainer;
