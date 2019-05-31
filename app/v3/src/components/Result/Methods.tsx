import * as React from 'react';
import { Panel } from 'react-bootstrap';

import { ExperimentResponse } from '../API/Experiment';

const Methods = ({ experiment }: { experiment?: ExperimentResponse }) => {
  const algorithms = experiment && experiment.algorithms;
  const validations = experiment && experiment.validations;

  return (
    (algorithms && validations && (
      <Panel>
        <Panel.Title>
          <h3>Methods</h3>
        </Panel.Title>
        <Panel.Body>
          {algorithms.map((algorithm: any, j: number) => (
            <div key={`name-${algorithm.code}-${j}`}>
              <p>
                <strong>{algorithm.name}</strong>
              </p>
              {algorithm.parameters && algorithm.parameters.length > 0 && <h3>Parameters</h3>}
              {algorithm.parameters &&
                algorithm.parameters.length > 0 &&
                algorithm.parameters.map((m: any, i: number) => (
                  <p key={`parameters-${algorithm.code}-${i}`}>
                    {m.code}: {m.value}
                  </p>
                ))}
            </div>
          ))}
          {validations.length > 0 && <h3>Validation</h3>}
          {validations.length > 0 &&
            validations.map((m: any, k: number) => (
              <p key={`validation-${m.code}-${k}`}>
                {m.code}: {m.parameters.map((p: any) => p.value)}
              </p>
            ))}
        </Panel.Body>
      </Panel>
    )) ||
    null
  );
};

export default Methods;
