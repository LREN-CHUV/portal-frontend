import * as React from 'react';
import Panel from '../UI/Panel';
import styled from 'styled-components';

import { ExperimentResponse } from '../API/Experiment';

const Param = styled.p`
  margin: 0 0 8px 0;
  overflow: wrap;
`;

const Algorithms = ({ experiment }: { experiment?: ExperimentResponse }) => {
  const algorithms = experiment && experiment.algorithms;
  const validations = experiment && experiment.validations;

  return (
    (algorithms && validations && (
      <Panel
        title="Algorithm"
        body={
          <>
            {algorithms.map((algorithm: any, j: number) => (
              <div key={`name-${algorithm.code}-${j}`}>
                <strong>{algorithm.name}</strong>
                {algorithm.parameters && algorithm.parameters.length > 0 && (
                  <h4>Parameters</h4>
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
          </>
        }
      />
    )) ||
    null
  );
};

export default Algorithms;
