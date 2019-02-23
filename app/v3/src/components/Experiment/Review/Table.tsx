import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import * as React from 'react';
import { MIP } from '../../../types';
import { round } from '../../utils';

import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import './Table.css';

interface IProps {
  minings?: MIP.Store.IMiningResponseShape[];
  selectedDatasets?: MIP.API.IVariable[];
  query?: MIP.API.IQuery;
  lookup: (code: string) => MIP.API.IVariableEntity;
}

interface IComputeMiningResult {
  minings?: MIP.Store.IMiningResponseShape[];
  selectedDatasets?: MIP.API.IVariableEntity[];
  variables?: MIP.API.IVariableEntity[];
}

interface ITableRow {
  variable?: string;
  category?: MIP.API.IVariable;
  [key: string]: string | MIP.API.IVariable | undefined;
}

const Table = ({ minings, selectedDatasets, query, lookup }: IProps) => {
  const rows = computeMinings({
    minings,
    selectedDatasets,
    variables:
      query &&
      [
        ...(query.variables || []),
        ...(query.coVariables || []),
        ...(query.groupings || [])
      ].map(v => lookup(v.code))
  });

  const columns = selectedDatasets
    ? [
        <Column
          header='VARIABLES'
          field='variable'
          key={'variable'}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((mining: MIP.API.IVariable) => (
          <Column header={mining.code} field={mining.code} key={mining.code} />
        ))
      ]
    : [];

  return <DataTable value={rows}>{columns}</DataTable>;
};

const findVariableData = (code: string, data: any) => {
  const theData = data.data;

  if (theData) {
    const variableData = theData.find(
      (r: any) => r.group && (r.group[0] === 'all' && r.index === code)
    );

    return variableData;
  }

  return;
};

const processPolynominalDataHeader = (code: string, data: any) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    return `${variableData.count} (null: ${variableData.null_count})`;
  }

  return;
};

const processPolynominalData = (
  code: string,
  categoryCode: string,
  data: any
) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    return variableData.frequency[categoryCode];
  }

  return;
};

const processContinuousData = (code: string, data: any) => {
  const variableData = findVariableData(code, data);
  if (variableData) {
    const mean = round(variableData.mean, 2);
    const min = round(variableData.min, 2);
    const max = round(variableData.max, 2);
    const std = round(variableData.std, 2);

    return mean ? `${mean} (${min}-${max}) - std: ${std}` : '-';
  }

  return;
};

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
    const isPolynominal =
      variable.type === 'polynominal' || variable.type === 'binominal';
    const row: ITableRow = {};
    let polynominalRows: ITableRow[] = [];

    // set labels, Variables + polynominal categories rows
    if (isPolynominal && variable.enumerations) {
      row.variable = variable.label;
      polynominalRows = variable.enumerations.reduce(
        (acc: any[], val: any) => [
          ...acc,
          { category: { code: val.code, label: val.label } }
        ],
        []
      );
    } else {
      row.variable = variable.label;
    }

    selectedDatasets.map(dataset => {
      // Process data
      const code = dataset.code;
      const mining = minings.find((m: any) => m.dataset.code === code);
      if (mining) {
        const { error, data } = mining;
        if (!error && !data) {
          row[code] = 'loading...';
          if (isPolynominal) {
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: 'loading...'
            }));
          }
        } else if (error) {
          row[code] = 'error';
          if (isPolynominal) {
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: 'error'
            }));
          }
        } else if (data) {
          if (isPolynominal) {
            row[code] = processPolynominalDataHeader(variable.code, data);
            polynominalRows = polynominalRows.map(r => ({
              ...r,
              [code]: processPolynominalData(
                variable.code,
                r.category!.code,
                data
              )
            }));
          } else {
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

const variableTemplate = (rowData: any, column: any) => (
  <span
    className={rowData.category ? 'datatable category' : 'datatable variable'}>
    {rowData.category ? rowData.category.label : rowData.variable}
  </span>
);

export default Table;
