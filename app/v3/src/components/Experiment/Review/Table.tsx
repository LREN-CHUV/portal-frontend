import * as React from "react";
import BootstrapTable from "react-bootstrap-table-next";
interface IProps {
  mining?: any[];
}

const Table = ({ mining }: IProps) => {

  if (!mining) {return null}

  const columns = [
    {
      dataField: "label",
      text: "Variables"
    },
    ...mining.map((dataset: any) => ({
      dataField: "std",
      text: dataset.name
    }))
  ];

  // const products = [
  //   { id: 12, name: "Item 12", price: 12.5, inStock: false },
  //   { id: 13, name: "Item 13", price: 13.5, inStock: true },
  //   { id: 14, name: "Item 14", price: 14.5, inStock: true }
  // ];

  const datasets =
    mining.map((m: any, i: number) =>
      m.data.data
        .filter((r: any) => r.group && r.group[0] === "all")
    );
  console.log(columns, datasets);

  return (
    <div>
      {datasets && (
        <BootstrapTable keyField="label" data={datasets} columns={columns} />
      )}
    </div>
  );
};
export default Table;
