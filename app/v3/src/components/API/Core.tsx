import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { excludedMethods } from '../constants';
import { buildExaremeAlgorithmList } from './ExaremeAPIAdapter';
import hierarchyMockup from './pathologiesHierarchyMockup';
import { buildWorkflowAlgorithmList } from './WorkflowAPIAdapter';

export enum Pathology {
  DEG = 'neurodegenerativediseases',
  TBI = 'tbi'
}

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

export interface Algorithm {
  code: string;
  name: string;
  parameters?: AlgorithmParameter[] | any;
  validation: boolean;
  constraints?: AlgorithmConstraint;
  type?: string[];
  source?: string;
}

export interface AlgorithmResult {
  name: string;
  mime: string;
  data: any[];
  error?: string;
}

// FIXME should be private
export interface AlgorithmConstraintParameter {
  binominal?: boolean;
  integer?: boolean;
  polynominal?: boolean;
  real?: boolean;
  min_count?: number;
  max_count?: number;
}

export interface AlgorithmConstraint {
  variable: AlgorithmConstraintParameter;
  covariable: AlgorithmConstraintParameter;
  groupings: AlgorithmConstraintParameter;
  mixed: boolean;
}

export interface AlgorithmParameter {
  code: string;
  constraints: any;
  default_value: any;
  value: any;
  values?: any;
  description: string;
  label: string;
  type: string;
  visible: boolean;
}

export interface Parameter {
  name: string;
  value: string;
}

interface PrivateAlgorithm {
  error: string | undefined;
  data: any | undefined;
}

export interface Stats {
  articles: number;
  users: number;
  variables: number;
}

export interface State {
  error?: string;
  loading?: boolean;
  hierarchy?: any;
  variables?: VariableEntity[];
  datasets?: VariableEntity[];
  algorithms?: Algorithm[];
  pathologies?: VariableEntity[];
  stats?: Stats
}

class Core extends Container<State> {
  public state: State = {};

  private options: request.Options;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;

    const pathologies = hierarchyMockup.groups.map(h => ({
      code: h.code,
      label: h.label
    }));

    this.setState({
      pathologies
    });
  }

  public lookup = (code: string): VariableEntity => {
    const variables = this.state.variables;
    const originalVar =
      variables && variables.find(variable => variable.code === code);

    return originalVar || { code, label: code };
  };

  public setPathology = (code: string) => {
    const hierarchy: any = hierarchyMockup.groups.filter(g => g.code === code).pop()

    let variables: any = [];
    // TODO: fanciest function
    const dummyAccumulator = (node: any) => {
      if (node.variables) {
        variables = [...variables, ...node.variables]
      }

      if (node.groups) {
        return node.groups.map(dummyAccumulator)
      }
    }
    hierarchy.groups.map(dummyAccumulator)

    return this.setState({
      hierarchy,
      variables
    });
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

  public stats = async () => {
    try {
    const data = await request.get(
      `${this.backendURL}/stats`,
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
      stats: json
    });
  } catch (error) {
    return await this.setState({
      error: error.message
    });
  }
  }

  public algorithms = async () =>
    Promise.all([
      this.wokenAlgorithms(),
      this.exaremeAlgorithms(),
      this.workflows()
    ]).then(
      ([wokenAlgorithms, exaremeAlgorithms, workflows]: [
        PrivateAlgorithm,
        PrivateAlgorithm,
        PrivateAlgorithm
      ]) => {
        const mergedAlgorithms: Algorithm[] = [
          ...((wokenAlgorithms.data && wokenAlgorithms.data.algorithms) || []),
          ...((exaremeAlgorithms && exaremeAlgorithms.data) || []),
          ...((workflows && workflows.data) || [])
        ];

        // FIXME: oh my god, that escalated quickly
        localStorage.setItem('algorithms', JSON.stringify(mergedAlgorithms));

        return this.setState(state => ({
          ...state,
          algorithms: mergedAlgorithms,
          error: undefined
        }));
      }
    );

  private workflows = async () => {
    try {
      const data = await request.get(
        `${this.backendURL}/methods/workflows`,
        this.options
      );
      const json = await JSON.parse(data);

      if (json.error) {
        return { error: json.error, data: undefined };
      }

      const workflowAlgorithms = buildWorkflowAlgorithmList(json);

      return { error: undefined, data: workflowAlgorithms };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };

  private wokenAlgorithms: any = async () => {
    try {
      const data = await request.get(
        `${this.backendURL}/methods`,
        this.options
      );
      const json = await JSON.parse(data);

      if (json.error) {
        return { error: json.error, data: undefined };
      }

      const nextJson = {
        ...json,
        algorithms: json.algorithms.filter(
          (a: any) => !excludedMethods.includes(a.code)
        )
      };

      return { error: undefined, data: nextJson };
    } catch (error) {
      return { error, data: undefined };
    }
  };

  private exaremeAlgorithms: any = async () => {
    try {
      const data = await request.get(
        `${this.backendURL}/methods/exareme`,
        this.options
      );
      const json = await JSON.parse(data);

      if (json.error) {
        return { error: json.error, data: undefined };
      }

      const nextJson = json.filter(
        (a: any) => !excludedMethods.includes(a.name)
      );

      const exaremeAlgorithms = buildExaremeAlgorithmList(nextJson);

      return { error: undefined, data: exaremeAlgorithms };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };
}

export default Core;
