import * as React from 'react';
import { Card } from 'react-bootstrap';

import { Result, State } from '../API/Experiment';
import ResultsErrorBoundary from '../UI/ResultsErrorBoundary';
import RenderResult from './RenderResult';

export default ({
  experimentState
}: {
  experimentState: State;
}): JSX.Element => {
  const experiment = experimentState && experimentState.experiment;
  const results = experiment && experiment.result;
  const error =
    (experimentState && experimentState.error) ||
    (experiment && experiment.status);
  const loading = !results && !error;
  const algorithmName = experiment && experiment.algorithm?.name;

  return (
    <Card>
      <Card.Body>
        <h4>{algorithmName}</h4>
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
      </Card.Body>
    </Card>
  );
};
