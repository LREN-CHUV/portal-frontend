import 'primeicons/primeicons.css';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import * as React from 'react';
import { Variable, VariableEntity } from '../API/Core';
import { MiningResponse } from '../API/Mining';
import { Query } from '../API/Model';
import Loader from '../UI/Loader';
import { round } from '../utils';
import './Table.css';
import { MIME_TYPES } from '../constants';

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

  if (!summaryStatistics || !selectedDatasets || !variables) {
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

    // fetch results by datasets
    selectedDatasets.forEach(dataset => {
      const datasetCode = dataset.code;
      const mining = summaryStatistics.find(
        (m: any) =>
          m.data.name === datasetCode && m.data.data[0] === variable.code
      );

      if (!mining) {
        row[datasetCode] = 'loading...';
        if (isMultinominal) {
          polynominalRows = polynominalRows.map(r => ({
            ...r,
            [datasetCode]: 'loading...'
          }));
        }
      }

      if (mining?.type === MIME_TYPES.WARNING) {
        row[datasetCode] = mining?.data;
      }

      if (mining?.data) {
        const fieldNames: [string] = mining.data.schema.fields.map(
          (f: { name: string }) => f.name
        );
        const variableData = mining.data.data;
        const get = (field: string): string | any =>
          variableData[fieldNames.indexOf(field)];
        const getRound = (field: string): string => round(get(field), 2);

        if (!variableData) {
          row[datasetCode] = 'No data';
        }

        if (isMultinominal) {
          row[datasetCode] = get('Count') as string;
          const frequencies = get('Frequencies');

          polynominalRows = polynominalRows.map(r => ({
            ...r,
            [datasetCode]: r.category?.code
              ? frequencies[r.category?.code]
                ? frequencies[r.category?.code]
                : '0'
              : '0'
          }));
        } else {
          const mean = getRound('Mean');
          row[datasetCode] = mean
            ? `${mean} (${getRound('Min')}-${getRound(
                'Max'
              )}) - std: ${getRound('Std.Err.')}`
            : '-';
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

  return rows && rows.length > 0 && columns && columns.length > 0 ? (
    <DataTable value={rows}>{columns}</DataTable>
  ) : variables && variables.length === 0 ? (
    <p>Please select a model or some variables from the previous screen</p>
  ) : (
    <Loader />
  );
};

export default Table;
