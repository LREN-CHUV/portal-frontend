import * as React from 'react';
import { round } from '../../utils';

import './JSON.css';

export default ({ row }: { row: any }) => {
  const starIt = (vvalue: number, formatedValue: string): string =>
    vvalue < 0.001
      ? `${formatedValue} (***)`
      : vvalue < 0.01
      ? `${formatedValue} (**)`
      : vvalue < 0.05
      ? `${formatedValue} (*)`
      : `${formatedValue}`;

  const headers = row && row.length > 0 && row[0];
  const body = row.slice(1);

  const computedBody = body.map((b: any) => {
    return b.map((c: any, i: number) => {
      if (c === null) {
        return '';
      }
      if (isNaN(Number(c))) {
        return c;
      } else if (headers[i] === 'p-value' || headers[i] === 'p') {
        // console.log(round(c))
        return typeof c === 'string' ? c : starIt(c, round(c));
      } else {
        return typeof c === 'string' ? c : round(c);
      }
    });
  });

  return (
    <table className='greyGridTable'>
      <thead>
        <tr>
          {headers.map((c: string) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {computedBody.map((r: any, k: number) => (
          <tr key={k}>
            {r.map((val: any, l: number) => (
              <td key={l}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
