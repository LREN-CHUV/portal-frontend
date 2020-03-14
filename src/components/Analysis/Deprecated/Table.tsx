import 'primeicons/primeicons.css';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import * as React from 'react';
import { Variable, VariableEntity } from '../../API/Core';
import { MiningResponseShape } from '../../API/Mining';
import { Query } from '../../API/Model';
import Loader from '../../UI/Loader';
import { round } from '../../utils';
import '../Table.css';

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
  const theData = data.data;

  if (theData) {
    const variableData = theData.find(
      (r: any) => r.group && r.group[0] === 'all' && r.index === code
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
    const isPolynominal =
      variable.type === 'multinominal' || variable.type === 'binominal';
    const row: ITableRow = {};
    let polynominalRows: ITableRow[] = [];

    // set labels, Variables + multinominal categories rows
    if (isPolynominal && variable.enumerations) {
      row.variable = variable.label;
      polynominalRows = variable.enumerations.reduce(
        (acc: any[], val: any) => [
          ...acc,
          {
            category: {
              code: val.code,
              label: val.label
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

const Table = ({ minings, selectedDatasets, query, lookup }: Props) => {
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
          header="VARIABLES"
          field="variable"
          key={'variable'}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((mining: Variable) => (
          <Column header={mining.code} field={mining.code} key={mining.code} />
        ))
      ]
    : [];

  return rows && rows.length > 0 && columns && columns.length > 0 ? (
    <DataTable value={rows}>{columns}</DataTable>
  ) : (
    <Loader />
  );
};

export default Table;
