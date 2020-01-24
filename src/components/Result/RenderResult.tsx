import * as React from 'react';

import { Result } from '../API/Experiment';
import { MIME_TYPES } from '../constants';
import { Highchart, JSONData } from '../UI/Visualization';
import Error from '../UI/Error';
import Warning from '../UI/Visualization/Warning';
import Dendogram from '../UI/Visualization/Dendogram';

export default ({
  results
}: {
  results: Result[] | undefined;
}): JSX.Element => {
  const renderResult = (result: Result): JSX.Element =>
    result && (
      <>
        {result.type === MIME_TYPES.ERROR && <Error message={result.data} />}
        {result.type === MIME_TYPES.WARNING && (
          <Warning message={result.data} />
        )}
        {result.type === MIME_TYPES.USER_WARNING && (
          <Warning message={result.data} />
        )}
        {result.type === MIME_TYPES.JSONDATA && <JSONData data={result.data} />}
        {result.type === MIME_TYPES.HIGHCHARTS &&
          !/empty/.test(
            result.data && result.data.subtitle && result.data.subtitle.text
          ) && <Highchart options={result.data} />}
        {result.type === MIME_TYPES.JSON && <Dendogram data={result.data} />}
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
