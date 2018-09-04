// tslint:disable:no-console

import * as React from "react";
import { LABELS } from '../../constants';

import './JSON.css'
export default ({ data }: { data: any }) =>

  (data &&
    data.map((row: any, i: number) => {
        console.log(row)
      const variables = Object.keys(row);
      const tables = variables.map(v => row[v]);
      const tableKeys = tables.map((k: any) => Object.keys(k));
      const headers: string[] = Array.from(
        new Set([].concat.apply([], tableKeys)))
        .map(h => LABELS.find(l => l.code === h) || {code: "", label: "", order: -1})
        // .filter(f => f.order !== -1)
        .sort((a, b) => a.order - b.order)
        .map(s => s.label)

    // return <pre key={i}>{JSON.stringify(headers, null, 3)}</pre>
      const computedHeaders = ["Variable"].concat(headers);
      const computedBody = variables.map((v: any, j: number) => {
        const val = tableKeys[j].map(key => tables[j][key]).map(n => !isNaN(n) ? n.toFixed(2) : '');
        return [v].concat(val)
      });

      return (
        <table key={i} className="greyGridTable">
          <thead>
            <tr>
              {computedHeaders.map(c => (
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
    })) ||
  null;