// tslint:disable:no-console

import * as React from "react";
import { LABELS } from '../../constants';

import './JSON.css'
export default ({ data }: { data: any }) =>

  (data &&
    data.map((row: any, i: number) => {
      const variables = Object.keys(row);
      const tables = variables.map(v => row[v]);
      const tableKeys = tables.map((k: any) => Object.keys(k));
      const mapCode = (code: string) => LABELS.find(l => l.code === code) || {code: "", label: "", order: -1}
      const headersKeys: string[] = Array.from(
        new Set([].concat.apply([], tableKeys)))
        .map(mapCode)
        .sort((a, b) => a.order - b.order)
        .map(s => s.code)
      const headers: string[] = headersKeys
        .map(mapCode)
        .map(s => s.label)

      const computedBody = variables.map((v: any, j: number) => {
        const val = headersKeys.map(key => tables[j][key]).map(n => !isNaN(n) ? n.toFixed(3) : '');
        return [v].concat(val)
      });

      return (
        <table key={i} className="greyGridTable">
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
    })) ||
  null;