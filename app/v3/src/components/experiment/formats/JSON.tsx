// tslint:disable:no-console

import * as React from "react";
import { LABELS } from "../../../constants";
import { round } from "../../../utils";

import "./JSON.css";

export default ({ row }: { row: any }) => {
  const variables = Object.keys(row);
  const tables = variables.map(v => row[v]);
  const tableKeys = tables.map((k: any) => Object.keys(k));
  const mapCode = (code: string) =>
    LABELS.find(l => l.code === code) || { code, label: code, order: -1 };
  const headersKeys: string[] = Array.from(
    new Set([].concat.apply([], tableKeys))
  )
    .map(mapCode)
    .sort((a, b) => a.order - b.order)
    .map(s => s.code);
  const headers: string[] = headersKeys.map(mapCode).map(s => s.label);

  const computedBody = variables.map((v: any, j: number) => {
    const val = headersKeys.map(key => {
      const value = tables[j][key];
      const cValue = !isNaN(value) ? round(value) : NaN;
      let output: number | string = cValue;
      if (key === "PR(>F)") {
        output =
          cValue < 0.001
            ? `${cValue} (***)`
            : cValue < 0.01
              ? `${cValue} (**)`
              : cValue < 0.05
                ? `${cValue} (*)`
                : `${cValue}`;
      }

      return output;
    });
    // .map(n => (!isNaN(n) ? round(n) : ""));
    return [v].concat(val);
  });

  return (
    <table className="greyGridTable">
      <thead>
        <tr>
          <th>Variables</th>
          {headers.map(c => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {computedBody.map((rows, k) => (
          <tr key={k}>
            {rows.map((val: any, l: number) => (
              <td key={l}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
