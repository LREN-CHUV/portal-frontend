import * as React from 'react';
import { LABELS } from '../../constants';
import { round } from '../../utils';

import { isNumber } from 'util';
import './JSON.css';

export default ({ row }: { row: any }) => {
  const variables = Object.keys(row);
  const tables = variables.map(v => row[v]);
  const tableKeys = tables.map((k: any) => Object.keys(k)).pop() || [];
  const mapCode = (code: string) =>
    LABELS.find(l => l.code === code) || { code, label: code, order: -1 };
  const headersKeys: string[] = tableKeys
    .map(mapCode)
    .sort((a, b) => a.order - b.order)
    .map(s => s.code);
  const headers: string[] = headersKeys.map(mapCode).map(s => s.label);

  const computedBody = variables.map((v: any, j: number) => {
    const val = headersKeys.map(key => {
      const value = tables[j][key];
      let output;
      const starIt = (vvalue: number, formatedValue: string): string =>
        vvalue < 0.001
          ? `${formatedValue} (***)`
          : vvalue < 0.01
          ? `${formatedValue} (**)`
          : vvalue < 0.05
          ? `${formatedValue} (*)`
          : `${formatedValue}`;

      if (
        (key === 'PR(>F)' || key === 'p_values' || key === 'p') &&
        isNumber(value)
      ) {
        output = starIt(value, round(value));
      } else {
        output = !isNaN(value) ? round(value) : '';
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
