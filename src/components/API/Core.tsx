import request from 'request-promise-native';
import { Container } from 'unstated';
import { backendURL } from '../API';
import { ENABLED_ALGORITHMS, UI_HIDDEN_PARAMETERS } from '../constants';
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
  isCategorical?: boolean;
  info?: string;
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
  desc?: string;
  parameters: AlgorithmParameter[];
  type?: string;
  source?: Engine;
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
  name: string;
  defaultValue: string;
  desc: string;
  type: string;
  columnValuesSQLType: string;
  columnValuesIsCategorical: string;
  columnValuesNumOfEnumerations: string;
  value: string;
  valueNotBlank: boolean;
  valueMultiple: boolean;
  valueType: string;
  visible?: boolean;
}

export interface Parameter {
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

  formatLookup = (code: string, originalVar: VariableEntity | undefined) => {
    if (originalVar) {
      const info = `${originalVar.label} (${originalVar.type})`;
      return { ...originalVar, info };
    } else {
      return { code, label: code, info: code };
    }
  };

  // FIXME: those infos should be in the frontend model
  public lookup = (code: string): VariableEntity => {
    const variables = this.state.variables;

    if (variables) {
      const originalVar =
        variables &&
        variables.find((variable: VariableEntity) => variable.code === code);

      return this.formatLookup(code, originalVar);
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

        return this.formatLookup(code, originalVar);
      }
    }

    return { code, label: code, info: code };
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
    const exaremeAlgorithms = await this.exaremeAlgorithms();
    this.setState(state => ({
      ...state,
      algorithms: [
        ...(state.algorithms || []),
        ...((exaremeAlgorithms && exaremeAlgorithms.data) || [])
      ],
      error: undefined
    }));

    const workflows = await this.workflows(isLocal);
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

  private exaremeAlgorithms: any = async () => {
    try {
      const response = await request.get(
        `${this.backendURL}/methods/exareme`,
        this.options
      );
      const json = await JSON.parse(response);

      if (json.error) {
        return { error: json.error, data: undefined };
      }

      const data = json.filter((algorithm: Algorithm) =>
        ENABLED_ALGORITHMS.includes(algorithm.name)
      );

      const surchargedParameter = data.map((d: Algorithm) => ({
        ...d,
        parameters: d.parameters.map((p: AlgorithmParameter) => ({
          ...p,
          value: '',
          visible: !UI_HIDDEN_PARAMETERS.includes(p.name)
        }))
      }));

      return { error: undefined, data: surchargedParameter };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };
}

export default Core;
