import * as React from 'react';

import { Result } from '../API/Experiment';
import { MIME_TYPES } from '../constants';
import Error from '../UI/Error';
import { Highchart, JSONData } from '../UI/Visualization';
import Dendogram from '../UI/Visualization/Dendogram';
import BinaryTree from '../UI/Visualization/BinaryTree';
import Warning from '../UI/Visualization/Warning';

export default ({
  results
}: {
  results: Result[] | undefined;
}): JSX.Element => {
  return (
    <>
      {results &&
        results.map(
          (result: any, i: number) =>
            result &&
            result.data &&
            !/empty/.test(
              result.data && result.data.subtitle && result.data.subtitle.text
            ) && (
              <div className="result" key={i}>
                {result.type === MIME_TYPES.ERROR && (
                  <Error message={result.data} />
                )}
                {result.type === MIME_TYPES.WARNING && (
                  <Warning message={result.data} />
                )}
                {result.type === MIME_TYPES.USER_WARNING && (
                  <Warning message={result.data} />
                )}
                {result.type === MIME_TYPES.JSONDATA && (
                  <JSONData data={result.data} />
                )}
                {result.type === MIME_TYPES.HIGHCHARTS && (
                  <Highchart options={result.data} />
                )}
                {result.type === MIME_TYPES.JSONBTREE && (
                  <BinaryTree data={result.data} />
                )}
                {result.type === MIME_TYPES.JSON && (
                  <Dendogram data={result.data} />
                )}
              </div>
            )
        )}
    </>
  );
};
