// tslint:disable:no-console
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

export interface IVariableContainer {
  error?: string;
  hierarchy?: any;
}

class ExploreContainer extends Container<IVariableContainer> {

  public state: IVariableContainer = {};

  private options: any;
  private baseUrl: string;
  // private groupBaseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}/variables/hierarchy`;
    // this.groupBaseUrl = `${config.baseUrl}/groups`;
  }

  public load = async () => {
    try {
      const data = await request.get(`${this.baseUrl}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      // const groupData = await request.get(`${this.groupBaseUrl}`, this.options);
      // const groupJson = await JSON.parse(groupData);
      // if (groupJson.error) {
      //   return await this.setState({
      //     error: groupJson.error
      //   });
      // }

      return await this.setState({
        error: undefined,
        hierarchy: json
        // groups: groupJson,
        // variables: json,
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default ExploreContainer;
