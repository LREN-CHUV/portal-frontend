import request from 'request-promise-native';
import { Container } from 'unstated';

import { MIP } from '../../types';
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

export interface State {
  error?: string;
  loading?: boolean;
  hierarchy?: any;
  variables?: VariableEntity[];
  datasets?: VariableEntity[];
  methods?: MIP.API.IMethods;
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
    console.log('exaremeAlgorithms');
    try {
      const data = await request.get(`${this.backendURL}/methods/exareme`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      const exaremeAlgorithms = json
        .filter((a: any) => a.name === 'PEARSON_CORRELATION')
        .map((a: any) => {
          const variableConstraintParams = a.parameters.find((p: any) => p.name === 'X');
          const variableTypes =
            variableConstraintParams &&
            variableConstraintParams.columnValuesSQLType.split(',').map((c: any) => c.trim());
          const variableColumnValuesIsCategorical =
            (variableConstraintParams && Boolean(variableConstraintParams.columnValuesIsCategorical)) || false;
          const variableConstraint = {
            binominal: variableColumnValuesIsCategorical,
            integer: variableTypes && variableTypes.includes('integer') ? true : false,
            polynominal: variableColumnValuesIsCategorical,
            real: variableTypes && variableTypes.includes('real') ? true : false
          };

          const covariableConstraintParams = a.parameters.find((p: any) => p.name === 'Y');
          const covariableTypes =
            covariableConstraintParams &&
            covariableConstraintParams.columnValuesSQLType.split(',').map((c: any) => c.trim());
          const covariableColumnValuesIsCategorical =
            (covariableConstraintParams && Boolean(covariableConstraintParams.columnValuesIsCategorical)) || false;
          const covariableConstraint = {
            binominal: covariableColumnValuesIsCategorical,
            integer: variableTypes && variableTypes.includes('integer') ? true : false,
            polynominal: covariableColumnValuesIsCategorical,
            real: variableTypes && variableTypes.includes('real') ? true : false
          };

          return {
            code: a.name,
            constraints: {
              covariables: covariableConstraint,
              variable: variableConstraint
            },
            description: a.desc,
            enabled: true,
            label: a.name,
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
