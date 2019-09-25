import '../Model.css';
import './Review.css';

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { MiningPayload } from '../API/Mining';
import { ModelResponse, Query } from '../API/Model';
import { AppConfig, InstanceMode } from '../App/App';
import { IAlert } from '../UI/Alert';
import Model from '../UI/Model';
import Validation from '../UI/Validation';
import Content from './Content';
import ContentDeprecated from './Deprecated/Content';
import Filter from './Filter';
import ExperimentReviewHeader from './Header';

interface Props extends RouteComponentProps {
  apiModel: APIModel;
  apiCore: APICore;
  apiMining: APIMining;
  appConfig: AppConfig;
}
interface State {
  alert?: IAlert;
  loadingSummary?: boolean;
  summaryStatistics?: any;
}

class Container extends React.Component<Props, State> {
  public state: State = {};

  public async componentDidMount() {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    const query = model && model.query;
    if (query) {
      this.fetchStatistics({ query });
    }
  }

  public render(): JSX.Element {
    const { apiCore, apiModel, apiMining, appConfig } = this.props;
    const { fields, filters } = this.makeFilters({ apiCore, apiModel });
    const model = apiModel.state.model;
    return (
      <div className="Model Review">
        <div className="header">
          <ExperimentReviewHeader
            handleGoBackToExplore={this.handleGoBackToExplore}
            handleSaveModel={this.handleSaveModel}
            handleRunAnalysis={this.handleRunExperiment}
            model={model}
          />
        </div>
        <div className="content">
          <div className="sidebar">
            <Model
              model={model}
              selectedSlug={model && model.slug}
              showDatasets={false}
              variables={apiCore.variablesForPathology(
                apiModel.state.model && apiModel.state.model.query.pathology
              )}
              items={apiModel.state.models}
              handleSelectModel={this.handleSelectModel}
            />
            <Panel className="datasets">
              <Panel.Body>
                <Validation
                  isPredictiveMethod={false}
                  datasets={apiCore.datasetsForPathology(
                    model && model.query && model.query.pathology
                  )}
                  query={model && model.query}
                  handleUpdateQuery={this.handleUpdateDatasets}
                />
              </Panel.Body>
            </Panel>
          </div>
          <div className="results">
            {appConfig.mode !== InstanceMode.Local && (
              <Content
                apiMining={apiMining}
                model={model}
                selectedDatasets={
                  model && model.query && model.query.trainingDatasets
                }
                lookup={apiCore.lookup}
              >
                <Panel className="filters" defaultExpanded={false}>
                  <Panel.Title toggle={true}>
                    <h3 className={'btn btn-info'}>Filters</h3>
                  </Panel.Title>
                  <Panel.Collapse>
                    <Panel.Body collapsible={true}>
                      {fields && fields.length > 0 && (
                        <Filter
                          rules={filters}
                          filters={fields}
                          handleChangeFilter={this.handleUpdateFilter}
                        />
                      )}
                    </Panel.Body>
                  </Panel.Collapse>
                </Panel>
              </Content>
            )}
            {appConfig.mode === InstanceMode.Local && (
              <ContentDeprecated
                apiMining={apiMining}
                model={model}
                selectedDatasets={
                  model && model.query && model.query.trainingDatasets
                }
                lookup={apiCore.lookup}
              >
                <Panel className="filters" defaultExpanded={false}>
                  <Panel.Title toggle={true}>
                    <h3 className={'btn btn-info'}>Filters</h3>
                  </Panel.Title>
                  <Panel.Collapse>
                    <Panel.Body collapsible={true}>
                      {fields && fields.length > 0 && (
                        <Filter
                          rules={filters}
                          filters={fields}
                          handleChangeFilter={this.handleUpdateFilter}
                        />
                      )}
                    </Panel.Body>
                  </Panel.Collapse>
                </Panel>
              </ContentDeprecated>
            )}
          </div>
        </div>
      </div>
    );
  }

  private makeFilters = ({
    apiCore,
    apiModel
  }: {
    apiCore: APICore;
    apiModel: APIModel;
  }): any => {
    const query = apiModel.state.model && apiModel.state.model.query;
    const variables = apiCore.variablesForPathology(query && query.pathology);

    // FIXME: move to Filter, refactor in a pure way
    let fields: any[] = [];
    const buildFilter = (code: string) => {
      if (!variables) {
        return [];
      }

      const originalVar = variables.find(
        (variable: VariableEntity) => variable.code === code
      );

      if (!originalVar) {
        return [];
      }

      const output: any = {
        id: code,
        label: originalVar.label,
        name: code
      };

      if (originalVar && originalVar.enumerations) {
        output.values = originalVar.enumerations.map((c: any) => ({
          [c.code]: c.label
        }));
        output.input = 'select';
        output.operators = ['equal', 'not_equal', 'in', 'not_in'];
      }

      const type = originalVar && originalVar.type;
      if (type === 'real') {
        output.type = 'double';
        output.input = 'number';
        output.operators = [
          'equal',
          'not_equal',
          'less',
          'greater',
          'between',
          'not_between'
        ];
      }

      if (type === 'integer') {
        output.type = 'integer';
        output.input = 'number';
        output.operators = [
          'equal',
          'not_equal',
          'less',
          'greater',
          'between',
          'not_between'
        ];
      }

      return output;
    };

    const keys = ['variables', 'coVariables', 'groupings', 'filtersFromParams'];
    const allVariables: string[] = [];
    if (query) {
      keys.forEach((key: string) => {
        const rows = query[key];
        if (rows) {
          rows.forEach((v: any) => {
            allVariables.push(v.code);
          });
        }
      });
    }

    // backward compatibility
    allVariables.push('subjectageyears');
    allVariables.push('gender');

    // add filter variables
    const extractVariablesFromFilter = (filter: any) =>
      filter.rules.forEach((r: any) => {
        if (r.rules) {
          extractVariablesFromFilter(r);
        }
        if (r.id) {
          allVariables.push(r.id);
        }
      });

    if (query && query.filters) {
      extractVariablesFromFilter(JSON.parse(query.filters));
    }

    const allUniqVariables = Array.from(new Set(allVariables));
    fields =
      (variables &&
        [...allUniqVariables.map(buildFilter)].filter((f: any) => f.id)) ||
      [];
    const filters = (query && query.filters && JSON.parse(query.filters)) || '';

    return { query, filters, fields };
  };

  private handleSaveModel = async ({
    title
  }: {
    title: string;
  }): Promise<void> => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    await apiModel.save({ model, title });
    this.setState({ alert: { message: 'Model saved' } });
  };

  private handleRunExperiment = async (): Promise<void> => {
    const { apiModel, apiMining } = this.props;
    const model = apiModel.state.model;
    if (model) {
      apiMining.abortMiningRequests();
      await apiModel.update({ model });
      const slug = model && model.slug;
      const { history } = this.props;
      history.push(`/experiment/${slug}`);
    }
  };

  private handleGoBackToExplore = (): void => {
    this.props.history.push(`/explore`);
  };

  private handleSelectModel = (model?: ModelResponse): void => {
    if (model) {
      this.props.apiModel.one(model && model.slug).then(() => {
        const query = model && model.query;
        if (query) {
          this.fetchStatistics({ query });
        }
      });
    }
  };

  private fetchStatistics = async ({
    query
  }: {
    query: Query;
  }): Promise<void> => {
    const { apiMining, appConfig } = this.props;
    const datasets = query.trainingDatasets;

    if (datasets && query) {
      const payload: MiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters ? query.filters : '',
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : [],
        pathology: query.pathology ? query.pathology : ''
      };
      if (appConfig.mode === InstanceMode.Local) {
        apiMining.summaryStatisticsByDataset({ payload });
      } else {
        apiMining.descriptiveStatisticsByDataset({ payload });
      }
    }
  };

  private handleUpdateDatasets = async (query: Query): Promise<void> => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    if (model) {
      model.query = query;
      await apiModel.setModel(model);
    }

    this.fetchStatistics({ query });
  };

  private handleUpdateFilter = async (filters: string): Promise<boolean> => {
    const { apiModel, apiMining } = this.props;
    const model = apiModel.state.model;
    if (model) {
      model.query.filters = (filters && JSON.stringify(filters)) || '';
      await apiModel.setModel(model);
    }

    const query = model && model.query;
    if (query) {
      apiMining.clear();
      this.fetchStatistics({ query });
    }

    return Promise.resolve(true);
  };
}

export default Container;
