import '../Model.css';
import './Review.css';

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { MiningPayload } from '../API/Mining';
import { ModelResponse, Query } from '../API/Model';
import { editPath } from '../Explore/Container';
import { IAlert } from '../UI/Alert';
import Model from '../UI/Model';
import Validation from '../UI/Validation';
import Content from './Content';
import Filter from './Filter';
import ExperimentReviewHeader from './Header';

interface Params {
  slug: string;
}
interface Props extends RouteComponentProps<Params> {
  apiModel: APIModel;
  apiCore: APICore;
  apiMining: APIMining;
}
interface State {
  alert?: IAlert;
  loadingSummary?: boolean;
  query?: Query;
  summaryStatistics?: any;
}

class Container extends React.Component<Props, State> {
  public state: State = {};

  public async componentDidMount() {
    const slug = this.props.match.params.slug;

    if (!slug) {
      return;
    }

    if (slug !== editPath) {
      await this.loadModel({ slug });
      const query = this.state.query;
      if (query) {
        this.setMinings({ query });
      }
    } else {
      const { apiModel } = this.props;
      const draft = apiModel.state.draft;
      if (draft) {
        const query = draft.query;
        this.setState({ query });
        this.setMinings({ query });
      }
    }
  }

  public async componentWillReceiveProps(nextProps: Props, prevState: State) {
    const slug = nextProps.match.params.slug;
    const prevSlug = this.props.match.params.slug;
    if (slug && prevSlug !== slug) {
      await this.loadModel({ slug });
      const query = this.state.query;
      if (query) {
        this.props.apiMining.clear();
        this.setMinings({ query });
      }
    }
  }

  public render() {
    const { apiCore, apiModel, apiMining } = this.props;
    const { query } = this.state;
    const { fields, filters } = this.makeFilters({ apiCore });
    const model = apiModel.state.model || apiModel.state.draft;
    return (
      <div className='Model Review'>
        <div className='header'>
          <ExperimentReviewHeader
            handleGoBackToExplore={this.handleGoBackToExplore}
            handleSaveModel={this.handleSaveModel}
            handleRunAnalysis={this.handleRunAnalysis}
            model={model}
          />
        </div>
        <div className='content'>
          <div className='sidebar'>
            <Model
              model={model}
              selectedSlug={this.props.match.params.slug}
              showDatasets={false}
              variables={apiCore.state.variables}
              items={apiModel.state.models}
              handleSelectModel={this.handleSelectModel}
            />
            <Panel className='model'>
              <Panel.Body>
                <Validation
                  isPredictiveMethod={false}
                  datasets={apiCore.state.datasets}
                  query={query}
                  handleUpdateQuery={this.handleUpdateDataset}
                />
              </Panel.Body>
            </Panel>
          </div>
          <div className='results'>
            <Content
              apiMining={apiMining}
              model={model}
              selectedDatasets={query && query.trainingDatasets}
              lookup={apiCore.lookup}>
              <Panel className='filters' defaultExpanded={false}>
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
          </div>
        </div>
      </div>
    );
  }

  private makeFilters = ({ apiCore }: { apiCore: APICore }) => {
    const { query } = this.state;
    const variables = apiCore.state.variables;

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
      (variables && [].concat.apply([], allUniqVariables.map(buildFilter))) ||
      [];

      console.log(fields)
    const filters = (query && query.filters && JSON.parse(query.filters)) || '';

    return { query, filters, fields };
  };

  private handleUpdateFilter = async (filters: string): Promise<boolean> => {
    const { apiModel, apiMining } = this.props;
    const model = apiModel.state.model;
    const draft = apiModel.state.draft;
    if (model) {
      model.query.filters = (filters && JSON.stringify(filters)) || '';
      await apiModel.update({ model });
    } else if (draft) {
      draft.query.filters = (filters && JSON.stringify(filters)) || '';
      apiModel.setDraft(draft);
    }
    const query = this.state.query;
    if (query) {
      apiMining.clear();
      this.setMinings({ query });
    }

    return Promise.resolve(true);
  };

  private handleSaveModel = async ({ title }: { title: string }) => {
    const { apiModel } = this.props;
    const model = apiModel.state.draft;
    const slug = await apiModel.save({ model, title });
    this.setState({ alert: { message: 'Model saved' } });

    const { history } = this.props;
    history.push(`/v3/review/${slug}`);
  };

  private handleRunAnalysis = async () => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    await apiModel.update({ model });
    const slug = this.props.match.params.slug;
    const { history } = this.props;
    history.push(`/v3/experiment/${slug}`);
  };

  private handleGoBackToExplore = async () => {
    const { history } = this.props;
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    if (model && model.slug) {
      await apiModel.update({ model });
      history.push(`/v3/explore/${model.slug}`);
    } else if (apiModel.state.draft) {
      await apiModel.setDraft(apiModel.state.draft);
      history.push(`/v3/explore/${editPath}`);
    } else {
      history.push(`/v3/explore`);
    }
  };

  private handleSelectModel = (model?: ModelResponse) => {
    if (model) {
      const { slug } = model;
      const { history } = this.props;
      history.push(`/v3/review/${slug}`);
    }
  };

  private loadModel = async ({ slug }: { slug: string }) => {
    const { apiModel } = this.props;
    await apiModel.one(slug);

    const model = apiModel.state.model;
    if (!model) {
      return this.setState({ alert: { message: 'Fail to load model' } });
    }

    const { query } = model;
    return this.setState({ query });
  };

  private setMinings = async ({ query }: { query: Query }) => {
    const { apiMining } = this.props;
    const datasets = query.trainingDatasets;

    if (datasets && query) {
      const payload: MiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters,
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : []
      };

      apiMining.summaryStatisticsByDataset({ payload });
      apiMining.heatmaps({ payload });
    }
  };

  private handleUpdateDataset = (query: Query): void => {
    this.setState({ query });
    this.setMinings({ query });
  };
}

export default Container;
