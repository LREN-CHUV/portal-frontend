import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { FORBIDDEN_ACCESS_MESSAGE } from '../constants';

import { Exareme } from '../API/Exareme';

export interface Variable {
  code: string;
  label?: string;
}
export interface VariableEntity extends Variable {
  type?: 'multinominal' | 'binominal' | 'real' | 'integer';
  sqlType?: string;
  description?: string;
  enumerations?: Variable[];
  group?: Variable[];
  isCategorical?: boolean;
  info?: string;
}

interface Pathology {
  code: string;
  label: string;
  datasets: VariableEntity[];
  metadataHierarchy: Hierarchy;
}

interface Hierarchy {
  code: string;
  label: string;
  groups: VariableEntity[];
  variables: VariableEntity[];
}

export type AlgorithmType =
  | 'workflow'
  | 'pipeline'
  | 'python_iterative'
  | 'python_local_global'
  | 'multiple_local_global'
  | 'python_local';
export interface Algorithm {
  name: string;
  label: string;
  desc?: string;
  parameters: AlgorithmParameter[] | AlgorithmParameterRequest[];
  type: AlgorithmType;
  datasetType?: string;
  enabled?: boolean;
}

export interface AlgorithmResult {
  name: string;
  label: string;
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
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  desc: string;
  type: string;
  columnValuesSQLType: string;
  columnValuesIsCategorical: string;
  columnValuesNumOfEnumerations: string;
  value: string;
  valueNotBlank: 'true' | 'false';
  valueMultiple: string;
  valueMin?: number | undefined;
  valueMax?: number | undefined;
  valueType: 'integer' | 'real' | 'json';
  visible?: boolean;
  valueEnumerations?: string[];
}

export interface AlgorithmParameterRequest {
  name: string;
  label: string;
  value: string;
}

export interface Parameter {
  label: string;
  name: string;
  value: any;
}

export interface Stats {
  articles: number;
  users: number;
  variables: number;
}

export interface Article {
  abstract?: string;
  content?: string;
  slug: string;
  status?: string;
  title?: string;
}

export interface GalaxyConfig {
  authorization?: string;
  context?: string;
  error?: { error?: string; message: string };
}

interface PathologiesVariables {
  [key: string]: VariableEntity[];
}

interface PathologiesHierarchies {
  [key: string]: Hierarchy;
}

export interface State {
  error?: string;
  loading?: boolean;
  algorithms?: Algorithm[];
  pathologies?: VariableEntity[];
  pathologyError?: string;
  article?: Article;
  articles?: Article[];
  stats?: Stats;
  galaxy?: GalaxyConfig;
  pathologiesVariables: PathologiesVariables;
  pathologiesDatasets: PathologiesVariables;
  pathologiesHierarchies: PathologiesHierarchies;
}

class Core extends Container<State> {
  state: State = {
    pathologiesVariables: {},
    pathologiesDatasets: {},
    pathologiesHierarchies: {}
  };

  private options: request.Options;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;
  }

  // TODO: those infos should be reconciliated in the model when the fetch occurs
  // At the moment, the model is storing only variable codes
  lookup = (
    code: string,
    pathologyCode: string | undefined
  ): VariableEntity => {
    if (!pathologyCode) {
      return { code, label: code, info: code };
    }

    const variablesForPathology = this.state.pathologiesVariables;

    if (!variablesForPathology) {
      return { code, label: code, info: code };
    }

    const variables = variablesForPathology[pathologyCode];
    if (variables) {
      const originalVar =
        variables &&
        variables.find((variable: VariableEntity) => variable.code === code);

      if (originalVar) {
        const info = `${originalVar.label} (${originalVar.type})`;
        return { ...originalVar, info };
      } else {
        return { code, label: code, info: code };
      }
    }

    return { code, label: code, info: code };
  };

  fetchPathologies = async (): Promise<void> => {
    try {
      const data = await request.get(
        `${this.backendURL}/pathologies`,
        this.options
      );
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      const pathologies: Variable[] = json.map((h: Variable) => ({
        code: h.code,
        label: h.label
      }));

      if (pathologies && pathologies.length === 0) {
        return await this.setState({
          pathologyError: FORBIDDEN_ACCESS_MESSAGE
        });
      }

      const pathologiesVariables = this.pathologiesVariables(json);
      const pathologiesDatasets = this.pathologiesDatasets(json);
      const pathologiesHierarchies = this.pathologiesHierarchies(json);

      return await this.setState({
        error: undefined,
        pathologies,
        pathologiesVariables,
        pathologiesDatasets,
        pathologiesHierarchies
      });
    } catch (error) {
      return await this.setState({
        pathologyError: FORBIDDEN_ACCESS_MESSAGE
      });
    }
  };

  algorithms = async (all = false): Promise<void> => {
    const exaremeAlgorithms = await this.fetchAlgorithms(all);
    this.setState(state => ({
      ...state,
      algorithms: [
        ...(state.algorithms || []),
        ...((exaremeAlgorithms && exaremeAlgorithms.data) || [])
      ],
      error: undefined
    }));

    return Promise.resolve();
  };

  fetchGalaxyConfiguration = async (): Promise<void> => {
    try {
      const data = await request.get(`${this.backendURL}/galaxy`, {
        ...this.options
      });
      const json = await JSON.parse(data);

      return await this.setState({
        galaxy: json
      });
    } catch (e) {
      // FIXME: Need to change the request library, not handling error status code
      try {
        return await this.setState({
          galaxy: { error: JSON.parse(e.error) }
        });
      } catch (e) {
        return await this.setState({
          galaxy: { error: { message: 'Unknow error' } }
        });
      }
    }
  };

  private defaultValueFor = ({
    label,
    defaults = {
      alpha: 0.1,
      kfold: 3,
      testSize: 0.2
    }
  }: {
    label: string;
    defaults?: any;
  }): string => {
    return defaults[label] ? defaults[label] : '';
  };

  private pathologiesVariables = (json: Pathology[]): PathologiesVariables => {
    const pathologiesVariables: PathologiesVariables = {};
    json.forEach(pathology => {
      let variables: VariableEntity[] = [];

      const dummyAccumulator = (node: any) => {
        if (node.variables) {
          variables = [...variables, ...node.variables];
        }

        if (node.groups) {
          return node.groups.map(dummyAccumulator);
        }
      };

      if (pathology) {
        dummyAccumulator(pathology.metadataHierarchy);
      }

      pathologiesVariables[pathology.code] = variables;
    });

    return pathologiesVariables;
  };

  private pathologiesDatasets = (json: Pathology[]): PathologiesVariables => {
    const pathologiesDatasets: PathologiesVariables = {};
    json.forEach(pathology => {
      pathologiesDatasets[pathology.code] = pathology.datasets;
    });

    return pathologiesDatasets;
  };

  private pathologiesHierarchies = (
    json: Pathology[]
  ): PathologiesHierarchies => {
    const pathologiesDatasets: PathologiesHierarchies = {};
    json.forEach(pathology => {
      pathologiesDatasets[pathology.code] = pathology.metadataHierarchy;
    });

    return pathologiesDatasets;
  };

  private fetchAlgorithms = async (
    all = false
  ): Promise<{
    error: string | undefined;
    data: Algorithm[] | undefined;
  }> => {
    try {
      const response = await request.get(
        `${this.backendURL}/algorithms`,
        this.options
      );
      const json = await JSON.parse(response);

      if (json.error) {
        return { error: json.error, data: undefined };
      }

      const algorithms = Exareme.algorithmOutputFiltering(json);
      const data = algorithms.sort((x: Algorithm, y: Algorithm) => {
        const a = x.label;
        const b = y.label;

        return a > b ? 1 : a < b ? -1 : 0;
      });

      return { error: undefined, data };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };
}

export default Core;
