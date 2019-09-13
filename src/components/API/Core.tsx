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
  hierarchy?: Hierarchy;
  variables?: VariableEntity[];
  datasets?: VariableEntity[];
  algorithms?: Algorithm[];
  pathologies?: VariableEntity[];
  pathology?: string;
  article?: Article;
  articles?: Article[];
  stats?: Stats;
}

let pathologiesCached: Pathology[] | undefined;

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

  public pathologies = async (): Promise<void> => {
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

      pathologiesCached = json;

      const pathologies = json.map((h: any) => ({
        code: h.code,
        label: h.label
      }));

      const pathology = json.length > 0 ? json[0] : undefined;
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
      pathology.hierarchy.groups.map(dummyAccumulator);

      return await this.setState({
        datasets: pathology.datasets,
        error: undefined,
        hierarchy: pathology.hierarchy,
        pathologies,
        pathology: pathology.code,
        variables
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public setPathology = (code: string): Promise<void> => {
    const pathology =
      pathologiesCached && pathologiesCached.filter(g => g.code === code).pop();

    return this.setState({
      datasets: pathology && pathology.datasets,
      hierarchy: pathology && pathology.hierarchy,
      pathology: pathology && pathology.code
    });
  };

  public datasets = async (): Promise<VariableEntity[] | undefined> =>
    Promise.resolve(this.state.datasets);

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

  public algorithms = async (isLocal: boolean): Promise<void> =>
    Promise.all([
      this.wokenAlgorithms(),
      this.exaremeAlgorithms(isLocal),
      this.workflows(isLocal)
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
      console.log(error);
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
