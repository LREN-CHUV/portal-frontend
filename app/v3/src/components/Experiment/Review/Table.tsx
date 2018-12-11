import * as React from "react";

interface IProps {
  mining?: any[];
}

const Table = ({ mining }: IProps) => (
  <div>
    {mining &&
      mining.map((m: any, i: number) => (
        <pre key={i}>{JSON.stringify(m, null, 4)}</pre>
      ))}
  </div>
);
export default Table;
