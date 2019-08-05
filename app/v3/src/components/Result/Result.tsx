import * as React from 'react';
import { Panel } from 'react-bootstrap';

import { State } from '../API/Experiment';
import RenderResult from './RenderResult';

export default ({ experimentState }: { experimentState: State }) => {
  // const json = require('./__mocks__/responses/fed-woken-knn-2.json');
  // const experiment = APIAdapter.parse(json);
  const experiment = experimentState && experimentState.experiment;
  const nodes = experiment && experiment.results;
  const error =
    (experimentState && experimentState.error) ||
    (experiment && experiment.error);

  const loading = !nodes && !error;

  return (
    <Panel>
      <Panel.Title>
        <h3>Your Experiment</h3>
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
        <RenderResult nodes={nodes} />
      </Panel.Body>
    </Panel>
  );
};
