import * as React from 'react';

import { Result } from '../API/Experiment';
import { MIME_TYPES } from '../constants';
import { Highchart, JSONData } from '../UI/Visualization';
import Error from '../UI/Visualization/Error';

export default ({ results }: { results: Result[] | undefined }) => {
  const renderResult = (result: Result) =>
    result && (
      <>
        {result.type === MIME_TYPES.ERROR && <Error message={result.data} />}
        {result.type === MIME_TYPES.JSONDATA && <JSONData data={result.data} />}
        {result.type === MIME_TYPES.HIGHCHARTS && (
          <Highchart options={result.data} />
        )}
      </>
    );

  return (
    <>
      {results &&
        results.map((result: any, i: number) => (
          <div className="result" key={i}>
            {renderResult(result)}
          </div>
        ))}
    </>
  );
};
