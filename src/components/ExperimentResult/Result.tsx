import * as React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';

import { Result, State, IExperiment } from '../API/Experiment';
import ResultsErrorBoundary from '../UI/ResultsErrorBoundary';
import RenderResult from './RenderResult';

const Body = styled(Card.Body)`
  min-height: 20vh;
`;

const LoadingTitle = styled.h5`
  margin-top: 16px;
`;

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
  const experiment = experimentState.experiment as IExperiment;
  const result = experiment?.result;
  const error = experiment.status === 'error';
  const loading = !result && !error;

  return (
    <Card>
      <Body>
        <h4>{experiment?.name}</h4>
        {loading ? (
          <div className="loading">
            <LoadingTitle>Your experiment is currently running</LoadingTitle>
            <div style={{ position: 'relative', overflowX: 'hidden' }}>
              <IndederminateProgressBar striped now={100} />
            </div>
            <p>
              Please check back in a moment. This page will automatically
              refresh once your experiment has finished executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="error">
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
