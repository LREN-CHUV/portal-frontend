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
  minings?: any[];
  selectedDatasets?: any[];
}

interface IComputeMiningResult {
  minings?: any[];
  selectedDatasets?: MIP.API.IVariableEntity[];
}

const computeMiningResultToTable = ({
  minings,
  selectedDatasets
}: IComputeMiningResult): any => {
  const computedRows: any[] = [];

  if (!minings || !selectedDatasets) {
    return computedRows;
  }

  const datasetOrder = selectedDatasets.map((s: any) => s.code);
  const orderedMinings = datasetOrder.map(
    (d: any) => minings.find((m: any) => m.dataset.code === d) || []
  );

  const datasetDatas = orderedMinings.map(
    dataset =>
      (dataset.data &&
        dataset.data &&
        dataset.data.length &&
        dataset.data.filter((r: any) => r.group && r.group[0] === "all")) ||
      []
  );

  const indexes =
    (datasetDatas.length > 0 && datasetDatas[0].map((d: any) => d.index)) || [];

  // populate each variable data by row
  const rows: any[] = [];
  indexes.map((index: any) => {
    const row: any = {};
    datasetDatas.map((datasetData: any, i: number) => {
      const dataRow = datasetData.find((d: any) => d.index === index) || {};
      row[i] = dataRow;
    });
    rows.push(row);
  });

  // compute rows data for output
  rows.map((row: any) => {
    const computedRow: any = {};
    const polynominalRows: any[] = [];
    let polynominalRow: any;

    Object.keys(row).map((rowKey: any) => {
      const col = row[rowKey];
      computedRow.variable = row[0].label;

      if (col.frequency) {
        const currentRow = row[rowKey];
        const nullCount = currentRow.null_count;
        computedRow[rowKey] =
          nullCount !== 0
            ? `${currentRow.count} (null: ${nullCount})`
            : currentRow.count;
        Object.keys(col.frequency).map((k: any) => {
          polynominalRow = polynominalRows.find(p => p.category === k);
          if (!polynominalRow) {
            polynominalRow = {};
            polynominalRows.push(polynominalRow);
          }
          polynominalRow[rowKey] = col.frequency[k];
          polynominalRow.category = k;
        });
      } else {
        const mean = round(row[rowKey].mean, 2);
        const min = round(row[rowKey].min, 2);
        const max = round(row[rowKey].max, 2);
        const std = round(row[rowKey].std, 2);
        computedRow[rowKey] = mean
          ? `${mean} (${min}-${max}) - std: ${std}`
          : "";
      }
    });

    computedRows.push(computedRow);
    polynominalRows.map((p: any) => {
      computedRows.push(p);
    });
  });

  return computedRows;
};

const variableTemplate = (rowData: any, column: any) => (
  <span
    className={rowData.category ? "datatable category" : "datatable variable"}
  >
    {rowData.category ? rowData.category : rowData.variable}
  </span>
);

const Table = ({ minings, selectedDatasets }: IProps) => {
  const tableData = computeMiningResultToTable({
    minings,
    selectedDatasets
  });

  const columns = selectedDatasets
    ? [
        <Column
          header="VARIABLES"
          field="variable"
          key={"variable"}
          body={variableTemplate}
        />,
        ...selectedDatasets.map((mining: any, index: number) => (
          <Column header={mining.code} field={`${index}`} key={index} />
        ))
      ]
    : [];

  return <DataTable value={tableData}>{columns}</DataTable>;
};
export default Table;
