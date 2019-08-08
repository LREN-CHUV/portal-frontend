import * as React from 'react';
import styled from 'styled-components';

import { round } from '../../utils';

const Table = styled.table`
  margin-bottom: 32px;
  table-layout: fixed;
  white-space: nowrap;
  min-width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 0 1px #e3e3e3;
  border-radius: 2px;
  border-style: none;
  border: 1px solid #eee;

  tr:nth-child(even) {
    background: #ebebeb;
  }

  th {
    background: #ebebeb;
    padding: 1px 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    text-align: center;
    border: 1px solid #e3e3e3;
    border-bottom: 1px solid #bbb;
  }

  th:first-child {
    border-left: 1px solid #eee;
    width: 200px !important;
    text-align: left;
  }

  td {
    border: 1px solid #e3e3e3;
    padding: 1px 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  td:first-child {
    font-weight: bold;
    text-align: left;
  }
`;

const Title = styled.h5`
  margin-bottom: 8px;
`


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
    if (field.type === 'string' || value === null) {
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
    <>
      <Title>{data.name}</Title>
      <Table>
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
      </Table>
    </>
  );
};
