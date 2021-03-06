import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

import { Engine, Result, State } from '../API/Experiment';
import RenderResult from './RenderResult';

const Body = styled(Panel.Body)`
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
    (algorithms && algorithms.length > 0 && algorithms[0].name) || '';

  return (
    <Panel>
      <Panel.Title>
        <h3>{algorithmName}</h3>
      </Panel.Title>
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
        <RenderResult results={results as Result[]} />
      </Body>
    </Panel>
  );
};
