import { round } from "@app/components/utils";
import { MIP } from "@app/types";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/nova-light/theme.css";
import "./Table.css";

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
  category?: string;
}

const computeMiningResultToTable = ({
  minings,
  selectedDatasets,
  variables
}: IComputeMiningResult): ITableRow[] => {
  const computedRows: ITableRow[] = [];

  if (!minings || !selectedDatasets || !variables) {
    return computedRows;
  }

  const processData = (code: string, data: any) => {
    const theData = data.data;
    let value = "data";
    const polynominalRows: any[] = [];

    if (theData) {
      const variableData = theData.find(
        (r: any) => r.group && (r.group[0] === "all" && r.index === code)
      );

      if (variableData) {
        if (variableData.frequency) {
          value = `${variableData.count} (null: ${variableData.null_count})`;
          Object.keys(variableData.frequency).map((k: any) => {
            polynominalRows.push(`${variableData.frequency[k]}`);
            // category = k
          });
        } else {
          const mean = round(variableData.mean, 2);
          const min = round(variableData.min, 2);
          const max = round(variableData.max, 2);
          const std = round(variableData.std, 2);
          value = mean ? `${mean} (${min}-${max}) - std: ${std}` : "null";
        }
      }
    }

    return value;
  };

  const rows: ITableRow[] = [];
  variables.forEach(variable => {
    const isPolynominal =
      variable.type === "polynominal" && variable.enumerations;
    selectedDatasets.map(dataset => {
      const row: ITableRow = {};
      let polynominalRows: ITableRow[] = [];

      // set labels, Variables + polynominal categories rows
      if (isPolynominal) {
        row.variable = variable.label;
        // tslint:disable
        variable.enumerations &&
          variable.enumerations.forEach(e => {
            polynominalRows.push({
              category: e.label
            });
          });
        // tslint:enable
      } else {
        row.variable = variable.label;
      }

      // Process data
      const code = dataset.code;
      const mining = minings.find((m: any) => m.dataset.code === code);
      if (mining) {
        const { error, data } = mining;
        if (!error && !data) {
          row[code] = "loading...";
          if (isPolynominal) {
            polynominalRows = polynominalRows.map(r => ({ ...r, [code]: "loading..."}))
          } 
        } else if (error) {
          row[code] = "error";
          if (isPolynominal) {
            polynominalRows = polynominalRows.map(r => ({ ...r, [code]: "error"}))
          } 
        } else if (data) {
          const value = processData(variable.code, data);
          row[code] = value;
        }
      }
      rows.push(row);
      polynominalRows.forEach(r => rows.push(r));
    });
  });

  return rows;
};

const variableTemplate = (rowData: any, column: any) => (
  <span
    className={rowData.category ? "datatable category" : "datatable variable"}
  >
    {rowData.category ? rowData.category : rowData.variable}
  </span>
);

const Table = ({ minings, selectedDatasets, query, lookup }: IProps) => {
  const rows = computeMiningResultToTable({
    minings,
    selectedDatasets,
    variables:
      query &&
      query.variables &&
      query.coVariables &&
      query.groupings &&
      [...query.variables, ...query.coVariables, ...query.groupings].map(v =>
        lookup(v.code)
      )
  });

  const columns = selectedDatasets
    ? [
        <Column
          header="VARIABLES"
          field="variable"
          key={"variable"}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((mining: MIP.API.IVariable) => (
          <Column header={mining.code} field={mining.code} key={mining.code} />
        ))
      ]
    : [];

  return <DataTable value={rows}>{columns}</DataTable>;
};
export default Table;
