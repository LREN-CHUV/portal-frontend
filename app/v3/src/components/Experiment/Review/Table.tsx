import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/nova-light/theme.css";

interface IProps {
  minings?: any[];
  computedData?: any;
}

const Table = ({ minings, computedData }: IProps) => {
  const columns = minings ? [
    <Column header="variable" field="variable" key={"variable"} />,
    ...minings.map((dataset: any, index: number) => (
      <Column header={dataset.name} field={`${index}`} key={index} />
     ))
  ] : [];

  return (
    <div>
      {!computedData && computedData && computedData.length && <p>loading...</p>}
      {computedData && computedData.length !== 0 && (
        <DataTable value={computedData}>{columns}</DataTable>
      )}
    </div>
  );
};
export default Table;
