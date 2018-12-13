import { round } from "@app/utils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";

import { MIP } from "@app/types";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/nova-light/theme.css";

interface IProps {
  minings?: any[];
  selectedDatasets?: MIP.API.IVariableEntity[];
}

const Table = ({ minings, selectedDatasets }: IProps) => {
  if (!minings) {
    return null;
  }


  const datasetDatas = minings.map(
    dataset =>
      (dataset.data &&
        dataset.data.data &&
        dataset.data.data.length &&
        dataset.data.data.filter(
          (r: any) => r.group && r.group[0] === "all"
        )) ||
      {}
  );

  // get variables indexes
  const indexes =
    datasetDatas.length && datasetDatas[0].map((d: any) => d.index) || [];

  // populate each variable data by row
  const rows: any[] = [];
  indexes.map((index: any) => {
    const row: any = {};
    datasetDatas.map((datasetData: any, i: number) => {
      const dataRow = datasetData.find((d: any) => d.index === index);
      row[i] = dataRow;
    });
    rows.push(row);
  });

  // compute rows data for output
  const computedRows: any[] = [];
  rows.map((row: any) => {
    const computedRow: any = {};
    const polynominalRows: any[] = [];
    let polynominalRow: any;

    Object.keys(row).map((rowKey: any) => {
      const col = row[rowKey];
      computedRow.variable = col.label;

      if (col.frequency) {
        computedRow[rowKey] = row[rowKey].count;
        Object.keys(col.frequency).map((k: any) => {
          polynominalRow = polynominalRows.find(p => p.variable === k);
          if (!polynominalRow) {
            polynominalRow = {};
            polynominalRows.push(polynominalRow);
          }
          polynominalRow[rowKey] = col.frequency[k];
          polynominalRow.variable = k;
        });
      } else {
        const mean = round(row[rowKey].mean, 2);
        const min = round(row[rowKey].min, 2);
        const max = round(row[rowKey].max, 2);
        const std = round(row[rowKey].std, 2);
        computedRow[rowKey] = mean
          ? `${mean} (${min}-${max}) - std: ${std}`
          : "-";
      }
    });

    computedRows.push(computedRow);
    polynominalRows.map((p: any) => {
      computedRows.push(p);
    });
  });

  const columns = [
    <Column header="variable" field="variable" key={"variable"} />,
    ...minings.map((dataset: any, index: number) => (
      <Column header={dataset.name} field={`${index}`} key={index} />
    ))
  ];

  return <DataTable value={computedRows}>{columns}</DataTable>;
};
export default Table;
