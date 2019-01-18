import Loader from "@app/components/UI/Loader";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/nova-light/theme.css";

interface IProps {
  loading: boolean;
  minings?: any[];
  tableData: any[];
}

const Table = ({ loading, minings, tableData }: IProps) => {
  const columns = minings
    ? [
        <Column header="VARIABLES" field="variable" key={"variable"} />,
        ...minings.map((mining: any, index: number) => (
          <Column header={mining.dataset.code} field={`${index}`} key={index} />
        ))
      ]
    : [];

  return (
    <div>
      {loading && <Loader />}
      {tableData.length > 0 && (
        <DataTable value={tableData}>{columns}</DataTable>
      )}
    </div>
  );
};
export default Table;
