import * as React from 'react';

import { Result } from '../API/Experiment';
import { MIME_TYPES } from '../constants';
import {
  Highchart,
  HTML,
  JSON as JSONDoc,
  JSONData,
  PFA,
  PlotlyPCA,
  VISEvilJS
} from '../UI/Visualization';

export default ({ results }: { results: Result[] | undefined }) => {
  const renderResult = (result: Result) =>
    result && (
      <div>
        {result.type === MIME_TYPES.ERROR && (
          <div className='error'>
            <h3>An error has occured</h3>
            <p>{result.data}</p>
          </div>
        )}
        {result.type === MIME_TYPES.JSON &&
          result.data.map((row: any, k: number) => (
            <JSONDoc key={k} row={row} />
          ))}
        {result.type === MIME_TYPES.PLOTLY &&
          result.data.map((d: { data: any; layout: any }, k: number) => (
            <PlotlyPCA data={d.data} layout={d.layout} key={k} />
          ))}
        {result.type === MIME_TYPES.VISJS &&
          result.data.map((d: any, k: number) => (
            <VISEvilJS jsString={d} key={k} />
          ))}
        {result.type === MIME_TYPES.HIGHCHARTS &&
          result.data.map((d: { data: any }, k: number) => (
            <Highchart options={d} key={k} />
          ))}
        {result.type === MIME_TYPES.PFA &&
            result.data.map((data: any, k: number) => (
              <PFA key={k} data={data} />
            ))}
        {result.type === MIME_TYPES.JSONDATA && (
          <JSONData data={result.data} />
        )
        }
        {result.type === MIME_TYPES.HTML &&
          result.data.map((doc: any, k: number) => <HTML doc={doc} key={k} />)}
        {result.type === MIME_TYPES.HTML &&
          result.data.map((doc: any, k: number) => <HTML doc={doc} key={k} />)}
        {result.type === MIME_TYPES.JSONRAW &&
          result.data.map((doc: object, k: number) => (
            <pre key={k}>{JSON.stringify(doc, null, 4)}</pre>
          ))}
      </div>
    );

  return (
    <>
      {results && results.map((result: any, i: number) => renderResult(result))}
    </>
  );
};
