import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import './Table.css';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import * as React from 'react';

import { Variable, VariableEntity } from '../API/Core';
import { MiningResponse } from '../API/Mining';
import { Query } from '../API/Model';
import { MIME_TYPES, PRIVACY_ERROR } from '../constants';
import Error from '../UI/Error';
import { round } from '../utils';

interface Props {
  summaryStatistics?: MiningResponse[];
  selectedDatasets?: Variable[];
  query?: Query;
  lookup: (code: string) => VariableEntity;
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

const computeResults = ({
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
    computedRows.push({ variable: 'Select some variables' });
    return computedRows;
  }

  if (!selectedDatasets) {
    computedRows.push({ variable: 'Select a dataset' });
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
      summaryStatistics[0].data.single;

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
    ].map(v => lookup(v.code));

  const rows = computeResults({
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

  const error =
    summaryStatistics &&
    summaryStatistics.find(
      (r: any) => r.type === MIME_TYPES.WARNING || r.type === MIME_TYPES.ERROR
    );

  return (
    <>
      {error && <Error message={error.data} />}
      {!error && <DataTable value={rows}>{columns}</DataTable>}
    </>
  );
};

export default Table;
