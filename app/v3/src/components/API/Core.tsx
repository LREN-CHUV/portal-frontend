import request from 'request-promise-native';
import { Container } from 'unstated';

import { MIP } from '../../types';
import { backendURL } from '../API';

// TODO: Implement that all over 
export interface Variable {
  code: string;
  label?: string;
}
// TODO: Implement that all over 
export interface VariableEntity extends Variable {
  type?: string;
  sqlType?: string;
  description?: string;
  enumerations?: Variable[];
  group?: Variable[];
}

class Core extends Container<MIP.Store.ICoreState> {
  public state: MIP.Store.ICoreState = {};

  private options: request.Options;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public lookup = (code: string): VariableEntity => {
    const variables = this.state.variables;
    const originalVar =
      variables && variables.find(variable => variable.code === code);

    return originalVar || { code, label: code };
  };

  public variables = async () => {
    try {
      const data = await request.get(`${this.backendURL}/variables`, this.options);
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
      const data = await request.get(`${this.backendURL}/variables/hierarchy`, this.options);
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
      const data = await request.get(`${this.backendURL}/datasets`, this.options);
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
      const data = await request.get(`${this.backendURL}/methods`, this.options);
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
