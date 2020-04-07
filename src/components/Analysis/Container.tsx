import '../Model.css';
import './Review.css';

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { MiningPayload } from '../API/Mining';
import { ModelResponse } from '../API/Model';
import { variablesFilter } from '../constants';
import { IAlert } from '../UI/Alert';
import LargeDatasetSelect from '../UI/LargeDatasetSelect';
import Model from '../UI/Model';
import Content from './Content';
import Filter from './Filter';
import ExperimentReviewHeader from './Header';

interface Props extends RouteComponentProps {
  apiModel: APIModel;
  apiCore: APICore;
  apiMining: APIMining;
}
interface State {
  alert?: IAlert;
  loadingSummary?: boolean;
  summaryStatistics?: any;
}

const Container = ({
  apiModel,
  apiCore,
  apiMining,
  ...props
}: Props): JSX.Element => {
  const { history } = props;

  const trainingDatasets =
    apiModel.state.model && apiModel.state.model.query.trainingDatasets;
  const queryfilters =
    apiModel.state.model && apiModel.state.model.query.filters;
  const [shouldReload, setShouldReload] = React.useState(true);

  React.useEffect(() => {
    const query = apiModel.state.model && apiModel.state.model.query;
    const datasets = query && query.trainingDatasets;

    if (!shouldReload) {
      return;
    }

    if (datasets && query) {
      const payload: MiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters ? query.filters : '',
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : [],
        pathology: query.pathology ? query.pathology : ''
      };

      apiMining.descriptiveStatisticsByDataset({ payload });
    }
  }, [
    apiModel.state.model,
    trainingDatasets,
    queryfilters,
    apiMining,
    shouldReload
  ]);

  const handleSaveModel = async ({
    title
  }: {
    title: string;
  }): Promise<void> => {
    setShouldReload(false);
    const model = apiModel.state.model;
    apiModel.save({ model, title });
  };

  const handleRunExperiment = async (): Promise<void> => {
    const model = apiModel.state.model;
    if (model) {
      apiMining.abortMiningRequests();
      await apiModel.update({ model });
      history.push(`/experiment`);
    }
  };

  const handleGoBackToExplore = (): void => {
    history.push(`/explore`);
  };

  const handleUpdateFilter = async (filters: string): Promise<void> => {
    const model = apiModel.state.model;
    if (model) {
      model.query.filters = (filters && JSON.stringify(filters)) || '';
      setShouldReload(true);
      await apiModel.setModel(model);
    }
  };

  const handleSelectModel = async (model?: ModelResponse): Promise<void> => {
    if (model) {
      setShouldReload(true);
      await apiModel.setModel(model);
    }
  };

  const makeFilters = ({
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
        label: originalVar.label || originalVar.code,
        name: code
      };

      if (originalVar && originalVar.enumerations) {
        output.values = originalVar.enumerations.map((c: any) => ({
          [c.code]: c.label || c.code
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
    let allVariables: string[] = [];
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

    allVariables = [...allVariables, ...variablesFilter];

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

  const { fields, filters } = makeFilters({ apiCore, apiModel });
  const model = apiModel.state.model;
  const query = model?.query;
  const datasets = apiCore.datasetsForPathology(query?.pathology);
  const selectedDatasets = model?.query?.trainingDatasets?.map(d => ({
    ...datasets?.find(v => v.code === d.code),
    ...d
  }));

  return (
    <div className="Model Review">
      <div className="header">
        <ExperimentReviewHeader
          handleGoBackToExplore={handleGoBackToExplore}
          handleSaveModel={handleSaveModel}
          handleRunAnalysis={handleRunExperiment}
          model={model}
        />
      </div>
      <div className="content">
        <div className="sidebar">
          <Panel className="datasets">
            <Panel.Body>
              <h5>
                <strong>Pathology</strong>
              </h5>
              <p>{query?.pathology}</p>
              <h5>
                <strong>Datasets</strong>
              </h5>
              <LargeDatasetSelect
                datasets={apiCore.datasetsForPathology(
                  query && query.pathology
                )}
                handleSelectDataset={apiModel.selectDataset}
                selectedDatasets={query?.trainingDatasets || []}
              ></LargeDatasetSelect>
            </Panel.Body>
          </Panel>
          <Model
            model={model}
            selectedSlug={model && model.slug}
            lookup={apiCore.lookup}
            items={apiModel.state.models}
            handleSelectModel={handleSelectModel}
          />
        </div>
        <div className="results">
          <Content
            apiMining={apiMining}
            model={model}
            selectedDatasets={selectedDatasets}
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
                      handleChangeFilter={handleUpdateFilter}
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
};

export default Container;
