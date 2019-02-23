import queryString from 'query-string';
import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { MIP } from '../../../types';
import { APICore, APIMining, APIModel } from '../../API';
import { IAlert } from '../../UI/Alert';
import Model from '../../UI/Model';
import Validation from '../../UI/Validation';
import Content from './Content';
import Filter from './Filter';
import ExperimentReviewHeader from './Header';

import './Review.css';
interface IProps extends RouteComponentProps<any> {
  apiModel: APIModel;
  apiCore: APICore;
  apiMining: APIMining;
}
interface IState {
  alert?: IAlert;
  loadingSummary?: boolean;
  query?: MIP.API.IQuery;
  mining?: any;
}

class Container extends React.Component<IProps, IState> {
  public state: IState = {};

  public async componentDidMount() {
    const qs = queryString.parse(this.props.location.search);

    if (qs.execute) {
      const variables = [{ code: qs.variable as string }];
      const coVariables =
        qs.covariable && (qs.covariable as string) !== ''
          ? (qs.covariable as string).split(',').map(v => ({
              code: v
            }))
          : undefined;
      const groupings =
        qs.grouping && (qs.grouping as string) !== ''
          ? (qs.grouping as string).split(',').map(v => ({
              code: v
            }))
          : undefined;
      const trainingDatasets =
        qs.trainingDatasets && (qs.trainingDatasets as string) !== ''
          ? (qs.trainingDatasets as string).split(',').map(v => ({
              code: v
            }))
          : undefined;
      const filterQuery =
        (qs.filterQuery && decodeURI(qs.filterQuery as string)) || '';
      const filtersFromParams =
        qs.filter && (qs.filter as string) !== ''
          ? (qs.filter as string).split(',').map(v => ({
              code: v
            }))
          : undefined;

      const query: MIP.Internal.IQuery = {
        coVariables,
        filters: filterQuery,
        filtersFromParams,
        groupings,
        trainingDatasets,
        variables
      };

      const { apiModel } = this.props;
      await apiModel.setMock(query);
      await this.setState({ query });
      this.createMining({ query });
    } else {
      const params = this.urlParams(this.props);
      const slug = params && params.slug;
      if (slug) {
        await this.loadModel({ slug });
        const query = this.state.query;
        if (query) {
          this.createMining({ query });
        }
      }
    }
  }

  public async componentWillReceiveProps(nextProps: IProps, prevState: IState) {
    const params = this.urlParams(nextProps);
    const slug = params && params.slug;
    const prevParams = this.urlParams(this.props);
    const prevSlug = prevParams && prevParams.slug;

    if (slug && prevSlug !== slug) {
      await this.loadModel({ slug });
      const query = this.state.query;
      if (query) {
        this.props.apiMining.clear();
        this.createMining({ query });
      }
    }
  }

  public render() {
    const { apiCore, apiModel, apiMining } = this.props;
    const { query } = this.state;
    const variables = apiCore.state.variables;

    // FIXME: move to Filter, refactor in a pure way
    let fields: any[] = [];
    const buildFilter = (code: string) => {
      if (!variables) {
        return;
      }

      const originalVar = variables.find(
        (variable: MIP.API.IVariableEntity) => variable.code === code
      );

      const output: any = originalVar
        ? {
            id: code,
            label: originalVar.label,
            name: code
          }
        : {};

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
      filter.rules.map((r: any) => {
        if (r.rules) {
          extractVariablesFromFilter(r);
        }
        if (r.id) { allVariables.push(r.id); }
      });

    if (query && query.filters) {
      extractVariablesFromFilter(JSON.parse(query.filters));
    }

    const allUniqVariables = Array.from(new Set(allVariables));
    fields =
      (variables && [].concat.apply([], allUniqVariables.map(buildFilter))) ||
      [];

    const filters = (query && query.filters && JSON.parse(query.filters)) || '';

    return (
      <div className='Experiment Review'>
        <div className='header'>
          <ExperimentReviewHeader
            handleGoBackToExplore={this.handleGoBackToExplore}
            handleSaveModel={this.handleSaveModel}
            handleRunAnalysis={this.handleRunAnalysis}
            modelName={apiModel.state.model && apiModel.state.model.title}
            models={apiModel.state.models}
            isMock={apiModel.state.model && apiModel.state.model.isMock}
            handleSelectModel={this.handleSelectModel}
          />
        </div>
        <div className='content'>
          <div className='sidebar'>
            <Model
              model={apiModel.state.model}
              showDatasets={false}
              variables={apiCore.state.variables}
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
              model={apiModel.state.model}
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

  private handleUpdateFilter = async (filters: string): Promise<boolean> => {
    const { apiModel, apiMining } = this.props;
    const model = apiModel.state.model;
    if (model) {
      model.query.filters = (filters && JSON.stringify(filters)) || '';
    }
    if (model && !model.isMock) {
      await apiModel.update({ model });
    }
    const query = this.state.query;
    if (query) {
      apiMining.clear();
      this.createMining({ query });
    }

    return Promise.resolve(true);
  };

  private handleSaveModel = async ({ title }: { title: string }) => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    const slug = await apiModel.save({ model, title });
    this.setState({ alert: { message: 'Model saved' } });

    const { history } = this.props;
    history.push(`/v3/review/${slug}`);
  };

  private handleRunAnalysis = async () => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    await apiModel.update({ model });

    const params = this.urlParams(this.props);
    const slug = params && params.slug;
    const { history } = this.props;
    history.push(`/v3/experiment/${slug}`);
  };

  private handleGoBackToExplore = () => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    const query = model && model.query;
    if (query) {
      const variable = query.variables && query.variables.map(v => v.code)[0];
      const covariable =
        (query.coVariables && query.coVariables.map(v => v.code).join(',')) ||
        '';
      const grouping =
        (query.groupings && query.groupings.map(v => v.code).join(',')) || '';
      const trainingDatasets =
        (query.trainingDatasets &&
          query.trainingDatasets.map(v => v.code).join(',')) ||
        '';

      const filterQuery = (query.filters && encodeURI(query.filters)) || '';

      window.location.href = `/explore?configure=true&variable=${variable}&covariable=${covariable}&grouping=${grouping}&filterQuery=${filterQuery}&trainingDatasets=${trainingDatasets}`;
    } else {
      window.location.href = `/explore`;
    }
  };

  private handleSelectModel = (model: MIP.API.IModelResponse) => {
    const { slug } = model;
    const { history } = this.props;
    history.push(`/v3/review/${slug}`);
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

  private createMining = async ({ query }: { query: MIP.API.IQuery }) => {
    const { apiMining } = this.props;
    const datasets = query.trainingDatasets;

    if (datasets && query) {
      const payload: MIP.API.IMiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters,
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : []
      };

      await apiMining.allByDataset({ payload });
      return this.setState({
        mining: apiMining.state.minings
      });
    }
  };

  private handleUpdateDataset = (query: MIP.API.IQuery): void => {
    this.setState({ query });
    this.createMining({ query });
  };

  private urlParams = (
    props: IProps
  ):
    | {
        slug: string | undefined;
      }
    | undefined => {
    const { location } = props;
    const slug = location.pathname.split('/').pop() || undefined;

    return { slug: slug !== 'review' ? slug : undefined };
  };
}

export default withRouter(Container);
