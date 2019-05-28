import request from 'request-promise-native';
import { Container } from 'unstated';
import { backendURL } from '../API';
import { excludedMethods } from '../constants';
import { parse } from './ExaremeAPIAdapter';
export interface Variable {
  code: string;
  label?: string;
}
export interface VariableEntity extends Variable {
  type?: string;
  sqlType?: string;
  description?: string;
  enumerations?: Variable[];
  group?: Variable[];
}

export interface Method {
  code: string;
  name: string;
  parameters?: [MethodPayload] | any;
  validation: boolean;
  constraints?: any;
  type?: string[];
  source?: string;
}

export interface MethodPayload {
  code: string;
  constraints: any;
  default_value: any;
  value: any;
  values?: any;
  description: string;
  label: string;
  type: string;
}

export interface Methods {
  algorithms: Method[];
}

export interface State {
  error?: string;
  loading?: boolean;
  hierarchy?: any;
  variables?: VariableEntity[];
  datasets?: VariableEntity[];
  methods?: Methods;
  exaremeAlgorithms?: any;
}

class Core extends Container<State> {
  public state: State = {};

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
      const data = await request.get(
        `${this.backendURL}/variables`,
        this.options
      );
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
      const data = await request.get(
        `${this.backendURL}/variables/hierarchy`,
        this.options
      );
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
      const data = await request.get(
        `${this.backendURL}/datasets`,
        this.options
      );
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
      const data = await request.get(
        `${this.backendURL}/methods`,
        this.options
      );
      const json = await JSON.parse(data);

      if (json.error) {
        return await this.setState(state => ({
          ...state,
          error: json.error
        }));
      }

      const nextJson = {
        ...json,
        algorithms: json.algorithms.filter(
          (a: any) => !excludedMethods.includes(a.code)
        )
      };

      return await this.setState(state => ({
        ...state,
        error: undefined,
        methods: nextJson
      }));
    } catch (error) {
      return await this.setState(state => ({
        ...state,
        error: error.message
      }));
    }
  };

  public exaremeAlgorithms = async () => {
    try {
      const data = await request.get(
        `${this.backendURL}/methods/exareme`,
        this.options
      );
      const json = await JSON.parse(data);

      if (json.error) {
        return await this.setState(state => ({
          error: json.error,
          ...state
        }));
      }

      const nextJson = json.filter(
        (a: any) => !excludedMethods.includes(a.code)
      );

      const exaremeAlgorithms = parse(nextJson);

      return await this.setState(state => ({
        error: undefined,
        exaremeAlgorithms,
        ...state
      }));
    } catch (error) {
      return await this.setState(state => ({
        error: error.message,
        ...state
      }));
    }
  };
}

export default Core;
