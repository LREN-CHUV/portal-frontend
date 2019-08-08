import * as React from 'react';
import { round } from '../../utils';

import './JSON.css';

interface Field {
  type: string;
  name: string;
}

interface Fields {
  fields: Field[];
}
interface TabularDataResource {
  profile: string;
  name: string;
  data: object[];
  schema: Fields;
}

export default ({ data: datas }: { data: TabularDataResource[] }) => {

  // FIXME: exareme data
  const data = (datas && datas.length > 0 && datas[0]) || undefined;

  if (!data) {
    return <div>No data</div>;
  }

  const formatNumber = (value: any, field: Field): string => {

    if (field.type !== 'number' || value === null) {
      return `${value}`;
    }

    const roundValue = round(value);

    if (
      field.name === 'p-value' ||
      field.name === 'p' ||
      field.name === 'prvalue'
    ) {
      return value < 0.001
        ? `${roundValue} (***)`
        : value < 0.01
        ? `${roundValue} (**)`
        : value < 0.05
        ? `${roundValue} (*)`
        : `${roundValue}`;
    }

    return `${roundValue}`;
  };

  return (
    <table className='greyGridTable'>
      <thead>
        <tr>
          {data.schema.fields.map((f: Field) => (
            <th key={f.name}>{f.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.data.map((row: any, k: number) => (
          <tr key={k}>
            {row.map((col: any, l: number) => (
              <td key={l}>{formatNumber(col, data.schema.fields[l])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
