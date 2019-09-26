import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import { excludedMethods } from '../constants';
import { buildExaremeAlgorithmList } from './ExaremeAPIAdapter';
import { Engine } from './Experiment';
import { buildWorkflowAlgorithmList } from './WorkflowAPIAdapter';

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

interface Pathology {
  code: string;
  label: string;
  datasets: VariableEntity[];
  hierarchy: Hierarchy;
}

interface Hierarchy {
  code: string;
  label: string;
  groups: VariableEntity[];
  variables: VariableEntity[];
}

export interface Algorithm {
  code: string;
  name: string;
  parameters?: AlgorithmParameter[] | any;
  validation: boolean;
  constraints?: AlgorithmConstraint;
  type?: string[];
  engine?: Engine;
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
  constraints?: any;
  default_value?: any;
  value: any;
  values?: any;
  description?: string;
  label?: string;
  type?: string;
  visible?: boolean;
}

export interface Parameter {
  name: string;
  value: any;
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

export interface Article {
  abstract?: string;
  content?: string;
  slug: string;
  status?: string;
  title?: string;
}

export interface State {
  error?: string;
  loading?: boolean;
  algorithms?: Algorithm[];
  pathologies?: VariableEntity[];
  pathologyJSON?: Pathology[];
  article?: Article;
  articles?: Article[];
  stats?: Stats;
  variables?: VariableEntity[];
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
    if (variables) {
      const originalVar =
        variables && variables.find((variable: any) => variable.code === code);

      return originalVar || { code, label: code };
    } else {
      const pathologyJSON = this.state.pathologyJSON;
      if (pathologyJSON) {
        let variables: any = [];

        const dummyAccumulator = (node: any) => {
          if (node.variables) {
            variables = [...variables, ...node.variables];
          }

          if (node.groups) {
            return node.groups.map(dummyAccumulator);
          }
        };

        pathologyJSON.map(p => dummyAccumulator(p.hierarchy));
        this.setState({ variables });

        const originalVar =
          variables &&
          variables.find((variable: any) => variable.code === code);

        return originalVar || { code, label: code };
      }
    }

    return { code, label: code };
  };

  public fetchPathologies = async (): Promise<void> => {
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

      const pathologies = json.map((h: any) => ({
        code: h.code,
        label: h.label
      }));

      return await this.setState({
        error: undefined,
        pathologyJSON: json,
        pathologies: pathologies
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public datasetsForPathology = (
    code: string | undefined
  ): VariableEntity[] | undefined => {
    const pathologyJSON = this.state.pathologyJSON;
    if (code && pathologyJSON) {
      const pathology = pathologyJSON.find(p => p.code === code);

      return pathology && pathology.datasets;
    }

    return undefined;
  };

  public hierarchyForPathology = (code: string | undefined) => {
    const pathologyJSON = this.state.pathologyJSON;
    if (code && pathologyJSON) {
      const pathology = pathologyJSON.find(p => p.code === code);

      return pathology && pathology.hierarchy;
    }

    return undefined;
  };

  public variablesForPathology = (code: string | undefined) => {
    const pathologyJSON = this.state.pathologyJSON;
    if (code && pathologyJSON) {
      const pathology = pathologyJSON.find(p => p.code === code);

      let variables: any = [];

      // TODO: fanciest function
      const dummyAccumulator = (node: any) => {
        if (node.variables) {
          variables = [...variables, ...node.variables];
        }

        if (node.groups) {
          return node.groups.map(dummyAccumulator);
        }
      };

      if (pathology) {
        dummyAccumulator(pathology.hierarchy);
      }
      return variables;
    }

    return undefined;
  };

  public stats = async (): Promise<void> => {
    try {
      const data = await request.get(`${this.backendURL}/stats`, this.options);
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
  };

  public algorithms = async (isLocal: boolean): Promise<void> => {
    const wokenAlgorithms = await this.wokenAlgorithms();
    this.setState(state => ({
      ...state,
      algorithms: [
        ...((wokenAlgorithms.data && wokenAlgorithms.data.algorithms) || [])
      ],
      error: undefined
    }));

    const exaremeAlgorithms: PrivateAlgorithm = await this.exaremeAlgorithms(
      isLocal
    );
    this.setState(state => ({
      ...state,
      algorithms: [
        ...(state.algorithms || []),
        ...((exaremeAlgorithms && exaremeAlgorithms.data) || [])
      ],
      error: undefined
    }));

    const workflows: PrivateAlgorithm = await this.workflows(isLocal);
    this.setState(state => ({
      ...state,
      algorithms: [
        ...(state.algorithms || []),
        ...((workflows && workflows.data) || [])
      ],
      error: undefined
    }));

    // FIXME: oh my god, that escalated quickly
    localStorage.setItem('algorithms', JSON.stringify(this.state.algorithms));

    return Promise.resolve();
  };

  public articles = async (): Promise<void> => {
    try {
      const data = await request.get(
        `${this.backendURL}/articles`,
        this.options
      );
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        articles: json,
        error: undefined
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public createArticle = async (payload: Article): Promise<void> => {
    try {
      const data = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        uri: `${this.backendURL}/articles`
      });
      const json = await JSON.parse(data);
      await this.setState({
        article: json,
        error: undefined
      });

      return json.slug;
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public updateArticle = async (
    slug: string,
    payload: Article
  ): Promise<void> => {
    try {
      const data = await request({
        body: JSON.stringify(payload),
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'PUT',
        uri: `${this.backendURL}/articles/${slug}`
      });
      const json = await JSON.parse(data);
      await this.setState({
        article: json,
        error: undefined
      });

      return json.slug;
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  private workflows = async (isLocal: boolean): Promise<any> => {
    if (isLocal) {
      return { error: undefined, data: [] };
    }

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
      return { error, data: undefined };
    }
  };

  private wokenAlgorithms: any = async (): Promise<any> => {
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

  private exaremeAlgorithms: any = async (isLocal: boolean) => {
    if (isLocal) {
      return { error: undefined, data: [] };
    }

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
