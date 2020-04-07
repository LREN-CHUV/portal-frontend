import 'primeicons/primeicons.css';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import * as React from 'react';
import { Variable, VariableEntity } from '../API/Core';
import { MiningResponseShape } from '../API/Mining';
import { Query } from '../API/Model';
import Loader from '../UI/Loader';
import { round } from '../utils';
import './Table.css';

interface Props {
  minings?: MiningResponseShape[];
  selectedDatasets?: Variable[];
  query?: Query;
  lookup: (code: string) => VariableEntity;
}

interface IComputeMiningResult {
  minings?: MiningResponseShape[];
  selectedDatasets?: VariableEntity[];
  variables?: VariableEntity[];
}

interface ITableRow {
  variable?: string;
  category?: Variable;
  [key: string]: string | Variable | undefined;
}

const findVariableData = (code: string, data: any) => {
  if (data) {
    const variableData = data.find(
      (r: any) => r && r.Label && r.Label === code
    );

    return variableData;
  }

  return;
};

const processMultinominalDataHeader = (code: string, data: any) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    return `${variableData.Count}`;
  }

  return;
};

const processMultinominalData = (
  code: string,
  categoryCode: string,
  data: any
) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    return variableData.Frequencies[categoryCode];
  }

  return;
};

const processContinuousData = (code: string, data: any) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    const mean = round(variableData.Mean, 2);
    const min = round(variableData.Min, 2);
    const max = round(variableData.Max, 2);
    const std = round(variableData['Std.Err.'], 2);

    return mean ? `${mean} (${min}-${max}) - std: ${std}` : '-';
  }

  return;
};

const variableTemplate = (rowData: any, column: any) => (
  <span
    className={rowData.category ? 'datatable category' : 'datatable variable'}
  >
    {rowData.category ? rowData.category.label : rowData.variable}
  </span>
);

const computeMinings = ({
  minings,
  selectedDatasets,
  variables
}: IComputeMiningResult): ITableRow[] => {
  const computedRows: ITableRow[] = [];

  if (!minings || !selectedDatasets || !variables) {
    return computedRows;
  }

  const rows: ITableRow[] = [];
  variables.forEach(variable => {
    const isMultinominal =
      variable.type === 'multinominal' || variable.type === 'binominal';
    const row: ITableRow = {};
    let polynominalRows: ITableRow[] = [];

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

    selectedDatasets.forEach(dataset => {
      // Process data
      const code = dataset.code;
      const mining = minings.find((m: any) => m.dataset.code === code);
      if (mining) {
        // console.log(mining);
        const { error, data } = mining;
        if (!error && !data) {
          row[code] = 'loading...';
          if (isMultinominal) {
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: 'loading...'
            }));
          }
        } else if (error) {
          row[code] = error;
          if (isMultinominal) {
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: error
            }));
          }
        } else if (data) {
          if (isMultinominal) {
            row[code] = processMultinominalDataHeader(variable.code, data);
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: processMultinominalData(
                variable.code,
                r.category!.code,
                data
              )
            }));
          } else {
            // row[code] = JSON.stringify(data);
            row[code] = processContinuousData(variable.code, data);
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
  minings,
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

  const rows = computeMinings({
    minings,
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
