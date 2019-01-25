import { backendURL } from "@app/components/API";
import { MIP } from "@app/types";
import request from "request-promise-native";
import { Container } from "unstated";

class Core extends Container<MIP.Store.ICoreState> {
  public state: MIP.Store.ICoreState = {};

  private backendURL: string;

  constructor(config: any) {
    super();
    this.backendURL = backendURL;
  }

  public variables = async () => {
    try {
      const data = await request.get(`${this.backendURL}/variables`);
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
      const data = await request.get(`${this.backendURL}/variables/hierarchy`);
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

  public datasets = async () => {
    try {
      const data = await request.get(`${this.backendURL}/datasets`);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        datasets: json,
        error: undefined
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public methods = async () => {
    try {
      const data = await request.get(`${this.backendURL}/methods`);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        methods: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Core;
