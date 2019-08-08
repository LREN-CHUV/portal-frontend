import * as React from 'react';
import { Panel } from 'react-bootstrap';

import { Engine, Node, Result, State } from '../API/Experiment';
import RenderResultDeprecated from './deprecated/RenderResult';
import RenderResult from './RenderResult';

export default ({ experimentState }: { experimentState: State }) => {
  const experiment = experimentState && experimentState.experiment;
  const results = experiment && experiment.results;
  const error =
    (experimentState && experimentState.error) ||
    (experiment && experiment.error);
  const loading = !results && !error;
  const algorithms = experiment && experiment.algorithms;
  const algorithmName = (algorithms && algorithms.length > 0 && algorithms[0].name) || '';

  return (
    <Panel>
      <Panel.Title>
        <h3>{algorithmName}</h3>
      </Panel.Title>
      <Panel.Body>
        {loading ? (
          <div className='loading'>
            <h3>Your experiment is currently running...</h3>
            <p>
              Please check back in a few minutes. This page will automatically
              refresh once your experiment has finished executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className='error'>
            <h3>An error has occured</h3>
            <p>{error}</p>
          </div>
        ) : null}
        {experiment && experiment.engine === Engine.Exareme ? (
          <RenderResult results={results as Result[]} />
        ) : (
          <RenderResultDeprecated nodes={results as Node[]} />
        )}
      </Panel.Body>
    </Panel>
  );
};
