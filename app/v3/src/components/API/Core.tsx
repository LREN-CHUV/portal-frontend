import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';

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
    const originalVar = variables && variables.find(variable => variable.code === code);

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

  public exaremeAlgorithms = async () => {
    try {
      const data = await request.get(`${this.backendURL}/methods/exareme`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      const buildConstraints = (algo: any, params: string[]) => {
        const variable = algo.parameters.find((p: any) => params.includes(p.name));
        const variableTypes = variable && variable.columnValuesSQLType.split(',').map((c: any) => c.trim());
        const variableColumnValuesIsCategorical = (variable && variable.columnValuesIsCategorical === 'true') || false;
        const variableConstraint = {
          binominal: variableColumnValuesIsCategorical,
          integer: variableTypes && variableTypes.includes('integer') ? true : false,
          polynominal: variableColumnValuesIsCategorical,
          real: variableTypes && variableTypes.includes('real') ? true : false
        };

        return variableConstraint;
      };

      const dependents = ['Y', 'column2', 'y', 'target_attributes'];
      const independents = ['X', 'column1', 'x', 'descriptive_attributes'];

      const buildParameters = (algo: any) => {
        const parameters = algo.parameters.filter(
          (p: any) => ![...dependents, ...independents, 'dataset', 'filter', 'outputformat', 'type'].includes(p.name)
        );

        const params =
          (parameters &&
            parameters.map((parameter: any) => ({
              code: parameter.name,
              constraints: {
                min: parameter.valueNotBlank ? 1 : 0
              },
              default_value: parameter.value,
              description: parameter.desc,
              label: parameter.name,
              type: parameter.valueType
            }))) ||
          [];

        return params;
      };

      const exaremeAlgorithms = json.map((algorithm: any) => {
        return {
          code: algorithm.name,
          constraints: {
            covariables: buildConstraints(algorithm, independents),
            variable: buildConstraints(algorithm, dependents)
          },
          parameters: buildParameters(algorithm),
          description: algorithm.desc,
          enabled: true,
          label: algorithm.name,
          source: 'exareme',
          type: ['exareme'],
          validation: true
        };
      });

      return await this.setState({
        error: undefined,
        exaremeAlgorithms
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Core;
