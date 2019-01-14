import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/nova-light/theme.css";

interface IProps {
  minings?: any[];
  tableData: any[];
}

const Table = ({ minings, tableData }: IProps) => {
  const columns = minings ? [
    <Column header="variable" field="variable" key={"variable"} />,
    ...minings.map((dataset: any, index: number) => (
      <Column header={dataset.name} field={`${index}`} key={index} />
     ))
  ] : [];

  return (
    <div>
      {tableData.length === 0 && <p>loading...</p>}
      {tableData.length > 0 && (
        <DataTable value={tableData}>{columns}</DataTable>
      )}
    </div>
  );
};
export default Table;
