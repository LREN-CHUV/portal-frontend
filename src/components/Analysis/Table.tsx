import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import './Table.css';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Variable, VariableEntity } from '../API/Core';
import { MiningResponse } from '../API/Mining';
import { Query } from '../API/Model';
import { ERRORS_OUTPUT, PRIVACY_ERROR } from '../constants';
import Error from '../UI/Error';
import { round } from '../utils';

interface Props {
  summaryStatistics?: MiningResponse[];
  selectedDatasets?: Variable[];
  query?: Query;
  lookup: (code: string, pathologyCode: string | undefined) => VariableEntity;
}

interface TableRow {
  variable?: string;
  category?: Variable;
  [key: string]: string | Variable | undefined;
}

const variableTemplate = (rowData: any, column: any) => (
  <span
    className={rowData.category ? 'datatable category' : 'datatable variable'}
  >
    {rowData.category ? rowData.category.label : rowData.variable}
  </span>
);

const computeSingleResults = ({
  summaryStatistics,
  selectedDatasets,
  variables
}: {
  summaryStatistics?: MiningResponse[];
  selectedDatasets?: VariableEntity[];
  variables?: VariableEntity[];
}): TableRow[] => {
  const computedRows: TableRow[] = [];

  if (!variables || variables.length === 0) {
    computedRows.push({ variable: 'Please, select some variables' });
    return computedRows;
  }

  if (!selectedDatasets) {
    computedRows.push({ variable: 'Please, select a dataset' });
    return computedRows;
  }

  const rows: TableRow[] = [];
  variables.forEach(variable => {
    const isMultinominal =
      variable.type === 'multinominal' || variable.type === 'binominal';
    const row: TableRow = {};
    let polynominalRows: TableRow[] = [];

    // set labels, Variables + multinominal categories rows
    if (isMultinominal && variable.enumerations) {
      row.variable = variable.label;
      polynominalRows = variable.enumerations.reduce(
        (acc: any[], val: any) => [
          ...acc,
          {
            category: {
              code: val.code,
              label: val.label || val.code
            }
          }
        ],
        []
      );
    } else {
      row.variable = variable.label;
    }

    const mining =
      summaryStatistics &&
      summaryStatistics.length > 0 &&
      summaryStatistics[0].data['single'];

    // fetch results by datasets
    selectedDatasets.forEach(dataset => {
      const datasetCode = dataset.code;
      if (!mining) {
        row[datasetCode] = 'loading...';
        if (isMultinominal) {
          polynominalRows = polynominalRows.map(r => ({
            ...r,
            [datasetCode]: 'loading...'
          }));
        }
      } else {
        const rowVariable = mining[variable.code];
        const rowData = rowVariable && rowVariable[datasetCode];

        if (!rowData) {
          row[datasetCode] = 'loading...';
        } else {
          if (isMultinominal) {
            const data = rowData.data;
            if (data === PRIVACY_ERROR) {
              row[datasetCode] = data;
              polynominalRows = polynominalRows.map(r => ({
                ...r,
                [datasetCode]: PRIVACY_ERROR
              }));
            } else {
              row[datasetCode] = rowData.num_datapoints;
              polynominalRows = polynominalRows.map(r => ({
                ...r,
                [datasetCode]: r?.category
                  ? rowData.data[r?.category?.code]
                  : ''
              }));
            }
          } else {
            const data = rowData.data;
            if (data === PRIVACY_ERROR) {
              row[datasetCode] = rowData.data;
            } else {
              const getRound = (value: number): string => round(value, 2);
              row[datasetCode] = `${getRound(data.mean)} (${getRound(
                data.min
              )} - ${getRound(data.max)}) - std: ${getRound(data.std)}`;
            }
          }
        }
      }
    });

    rows.push(row);
    polynominalRows.forEach(r => rows.push(r));
  });

  return rows;
};

const computeModelResults = ({
  summaryStatistics,
  selectedDatasets,
  variables
}: {
  summaryStatistics?: MiningResponse[];
  selectedDatasets?: VariableEntity[];
  variables?: VariableEntity[];
}): TableRow[] => {
  const computedRows: TableRow[] = [];

  if (!variables || variables.length === 0) {
    computedRows.push({ variable: 'Please, select some variables' });
    return computedRows;
  }

  if (!selectedDatasets) {
    computedRows.push({ variable: 'Please, select a dataset' });
    return computedRows;
  }

  const rows: TableRow[] = [];
  variables.forEach(variable => {
    const isMultinominal =
      variable.type === 'multinominal' || variable.type === 'binominal';
    const row: TableRow = {};
    let polynominalRows: TableRow[] = [];

    // set labels, Variables + multinominal categories rows
    if (isMultinominal && variable.enumerations) {
      row.variable = variable.label;
      polynominalRows = variable.enumerations.reduce(
        (acc: any[], val: any) => [
          ...acc,
          {
            category: {
              code: val.code,
              label: val.label || val.code
            }
          }
        ],
        []
      );
    } else {
      row.variable = variable.label;
    }

    const mining =
      summaryStatistics &&
      summaryStatistics.length > 0 &&
      summaryStatistics[0].data['model'];

    // fetch results by datasets
    selectedDatasets.forEach(dataset => {
      const datasetCode = dataset.code;
      if (!mining) {
        row[datasetCode] = 'loading...';
        if (isMultinominal) {
          polynominalRows = polynominalRows.map(r => ({
            ...r,
            [datasetCode]: 'loading...'
          }));
        }
      } else {
        const rowVariable = mining[dataset.code];
        const rowData = rowVariable?.data[variable.code];

        if (!rowData) {
          row[datasetCode] = 'loading...';
        } else {
          if (isMultinominal) {
            const data = rowData;
            if (data === PRIVACY_ERROR) {
              row[datasetCode] = data;
              polynominalRows = polynominalRows.map(r => ({
                ...r,
                [datasetCode]: PRIVACY_ERROR
              }));
            } else {
              row[datasetCode] = rowData.num_datapoints;
              polynominalRows = polynominalRows.map(r => ({
                ...r,
                [datasetCode]: r?.category ? rowData[r?.category?.code] : ''
              }));
            }
          } else {
            const data = rowData;
            if (data === PRIVACY_ERROR) {
              row[datasetCode] = data;
            } else {
              const getRound = (value: number): string => round(value, 2);
              row[datasetCode] = `${getRound(data.mean)} (${getRound(
                data.min
              )} - ${getRound(data.max)}) - std: ${getRound(data.std)}`;
            }
          }
        }
      }
    });

    rows.push(row);
    polynominalRows.forEach(r => rows.push(r));
  });

  return rows;
};

const Table = ({
  summaryStatistics,
  selectedDatasets,
  query,
  lookup
}: Props): JSX.Element => {
  const variables =
    query &&
    [
      ...(query.variables || []),
      ...(query.coVariables || []),
      ...(query.groupings || [])
    ].map(v => lookup(v.code, query?.pathology));

  const rows = computeSingleResults({
    summaryStatistics,
    selectedDatasets,
    variables
  });

  const rows2 = computeModelResults({
    summaryStatistics,
    selectedDatasets,
    variables
  });

  const columns = selectedDatasets
    ? [
        <Column
          header="VARIABLES"
          field="variable"
          key={'variable'}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((mining: Variable) => (
          <Column
            header={mining.label || mining.code}
            field={mining.code}
            key={mining.code}
          />
        ))
      ]
    : [];

  const columns2 = selectedDatasets
    ? [
        <Column
          header="VARIABLES"
          field="variable"
          key={'variable'}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((dataset: Variable) => {
          const mining =
            summaryStatistics &&
            summaryStatistics.length > 0 &&
            summaryStatistics[0].data['model'];
          const sum = mining && mining[dataset.code];
          const total = (sum && sum.num_datapoints) || '';
          return (
            <Column
              header={`${dataset.label || dataset.code} (${total})`}
              field={dataset.code}
              key={dataset.code}
            />
          );
        })
      ]
    : [];

  const error =
    summaryStatistics &&
    summaryStatistics.find((r: any) => ERRORS_OUTPUT.includes(r.type));

  return (
    <>
      {error && <Error message={error.data} />}
      {!error && (
        <Tabs defaultActiveKey={1} id="uncontrolled-mining-tab">
          <Tab eventKey={1} title="Single">
            <DataTable value={rows}>{columns}</DataTable>
          </Tab>
          <Tab eventKey={2} title="Model">
            <DataTable value={rows2}>{columns2}</DataTable>
          </Tab>
        </Tabs>
      )}
    </>
  );
};

export default Table;
