import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

import { ExperimentResponse } from '../API/Experiment';

const Title = styled.h3`
  margin: 16px 0 8px 0;
`;

const Param = styled.p`
  margin: 0 0 8px 0;
  overflow: wrap;
`;

const Algorithms = ({ experiment }: { experiment?: ExperimentResponse }) => {
  const algorithms = experiment && experiment.algorithms;
  const validations = experiment && experiment.validations;

  return (
    (algorithms && validations && (
      <Panel>
        <Panel.Title>
          <Title>Algorithm</Title>
        </Panel.Title>
        <Panel.Body>
          {algorithms.map((algorithm: any, j: number) => (
            <div key={`name-${algorithm.code}-${j}`}>
              <strong>{algorithm.name}</strong>
              {algorithm.parameters && algorithm.parameters.length > 0 && (
                <Title>Parameters</Title>
              )}
              {algorithm.parameters &&
                algorithm.parameters.length > 0 &&
                algorithm.parameters.map((m: any, i: number) => (
                  <Param key={`parameters-${algorithm.code}-${i}`}>
                    {m.code}: {m.value}
                  </Param>
                ))}
            </div>
          ))}
          {validations.length > 0 && <h3>Validation</h3>}
          {validations.length > 0 &&
            validations.map((m: any, k: number) => (
              <Param key={`validation-${m.code}-${k}`}>
                {m.code}: {m.parameters.map((p: any) => p.value)}
              </Param>
            ))}
        </Panel.Body>
      </Panel>
    )) ||
    null
  );
};

export default Algorithms;
