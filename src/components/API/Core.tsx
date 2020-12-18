import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';
import {
  ALGORITHMS_OUTPUT,
  FORBIDDEN_ACCESS_MESSAGE,
  UI_HIDDEN_PARAMETERS
} from '../constants';

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
  metadataHierarchy: Hierarchy;
}

interface Hierarchy {
  code: string;
  label: string;
  groups: VariableEntity[];
  variables: VariableEntity[];
}

export interface Algorithm {
  name: string;
  label: string;
  desc?: string;
  parameters: AlgorithmParameter[] | AlgorithmParameterRequest[];
  type: string;
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
  valueNotBlank: string;
  valueMultiple: string;
  valueMin?: number | null;
  valueMax?: number | null;
  valueType: string;
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
        pathologyError: error.message
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

  articles = async (): Promise<void> => {
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

  createArticle = async (payload: Article): Promise<void> => {
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

  updateArticle = async (slug: string, payload: Article): Promise<void> => {
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

      const algorithms = all
        ? json
        : json.filter(
            (algorithm: Algorithm) =>
              algorithm.enabled ||
              ALGORITHMS_OUTPUT.find(a => algorithm.name === a.name)?.enabled
          );

      const data = algorithms.sort((x: Algorithm, y: Algorithm) => {
        const a = x.label;
        const b = y.label;

        return a > b ? 1 : a < b ? -1 : 0;
      });

      // FIXME: Algorithms defnition in Exareme will contains those extra parameters.
      const extraParametersData = data.map((algorithm: Algorithm) => ({
        ...algorithm,
        parameters: [
          ...(algorithm.parameters as AlgorithmParameter[]).map(
            (p: AlgorithmParameter) => {
              const visible = !UI_HIDDEN_PARAMETERS.includes(p.label || '');

              // Semantic adjustements:
              // For historical reason, exareme serves a "value" as a "defaultValue".
              // doesn't work for x,y,dataset and pathology. So we blank our "value", and
              // assign the default on the fly, if the user didn't provide it's own value
              // Exareme's "defaultValue" on an other hand is a placeholder, a recommendation

              const parameter = {
                ...p,
                value: visible ? p.value : '',
                defaultValue: p.value,
                placeholder: p.defaultValue,
                visible
              };

              if (parameter.label === 'standardize') {
                return {
                  name: 'standardize',
                  label: 'standardize',
                  valueEnumerations: ['false', 'true'],
                  defaultValue: 'false',
                  value: 'false',
                  desc: 'Standardize'
                };
              }

              return parameter;
            }
          ),
          // TODO: delete this once we have the formula
          ...(algorithm.label === 'ANOVA' ||
          algorithm.label === 'Linear Regression'
            ? [
                {
                  name: 'design',
                  label: 'design',
                  valueEnumerations: ['none', 'factorial', 'additive'],
                  defaultValue: 'none',
                  value: 'none',
                  desc: 'Operator for the variables'
                }
              ]
            : [])
        ]
      }));

      const workflowParametersData = extraParametersData.map(
        (algorithm: Algorithm) => {
          if (algorithm.type === 'workflow') {
            return {
              ...algorithm,
              parameters: (algorithm.parameters as AlgorithmParameter[]).map(
                parameter => ({
                  ...parameter,
                  defaultValue: this.defaultValueFor({
                    label: parameter.label || ''
                  }),
                  value: this.defaultValueFor({
                    label: parameter.label || ''
                  })
                })
              )
            };
          }

          return algorithm;
        }
      );

      return { error: undefined, data: workflowParametersData };
    } catch (error) {
      console.log(error);
      return { error, data: undefined };
    }
  };
}

export default Core;
