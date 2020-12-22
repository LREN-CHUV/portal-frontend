import * as React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';

import { Result, State } from '../API/Experiment';
import ResultsErrorBoundary from '../UI/ResultsErrorBoundary';
import RenderResult from './RenderResult';

const Body = styled(Card.Body)`
  min-height: 50vh;
`

const indeterminateAnimation = keyframes`
 from {
      left: -25%;
      width: 25%;
    }
    to {
      left: 100%;
      width: 25%;
    }
`;

const IndederminateProgressBar = styled(ProgressBar)`
  position: relative;
  animation-name: ${indeterminateAnimation};
  animation-duration: 3s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

export default ({
  experimentState
}: {
  experimentState: State;
}): JSX.Element => {
  const experiment = experimentState.experiment;
  const result = experiment?.result;
  const error = experimentState.error;
  const loading = !result && !error;

  return (
    <Card>
      <Body>
        {loading ? (
          <div className="loading">
            <h3>Your experiment is currently running</h3>
            <div style={{ position: 'relative', overflowX: 'hidden' }}>
              <IndederminateProgressBar striped now={100} />
            </div>
            <p>
              Please check back in a few minutes. This page will automatically
              refresh once your experiment has finished executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="error">
            <h3>An error has occured</h3>
            <p>{error}</p>
          </div>
        ) : null}
        <ResultsErrorBoundary>
          <RenderResult results={result as Result[]} />
        </ResultsErrorBoundary>
      </Body>
    </Card>
  );
};
