import * as React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

import { Result, State } from '../API/Experiment';
import ResultsErrorBoundary from '../UI/ResultsErrorBoundary';
import RenderResult from './RenderResult';

const Body = styled(Card.Body)`
  padding: 0 16px;
`;

export default ({
  experimentState
}: {
  experimentState: State;
}): JSX.Element => {
  const experiment = experimentState && experimentState.experiment;
  const results = experiment && experiment.results;
  const error =
    (experimentState && experimentState.error) ||
    (experiment && experiment.error);
  const loading = !results && !error;
  const algorithms = experiment && experiment.algorithms;
  const algorithmName =
    (algorithms &&
      algorithms.length > 0 &&
      (algorithms[0].label || algorithms[0].name)) ||
    '';

  return (
    <Card>
      <Card.Title>
        <h3>{algorithmName}</h3>
      </Card.Title>
      <Body>
        {loading ? (
          <div className="loading">
            <h3>Your experiment is currently running...</h3>
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
          <RenderResult results={results as Result[]} />
        </ResultsErrorBoundary>
      </Body>
    </Card>
  );
};
