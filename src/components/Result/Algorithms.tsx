import * as React from 'react';
import styled from 'styled-components';

import { Algorithm } from '../API/Core';
import { ExperimentResponse } from '../API/Experiment';
import { UI_HIDDEN_PARAMETERS } from '../constants';

const Param = styled.p`
  overflow: wrap;
  width: 200px;
  word-wrap: break-word;
  display: inline-block;
`;

const Algorithms = ({
  experiment
}: {
  experiment?: ExperimentResponse;
}): JSX.Element | null => {
  const algorithms = experiment && experiment.algorithms;

  return (
    (algorithms && (
      <>
        <h4>Algorithm</h4>
        {
          <>
            {algorithms.map((algorithm: Algorithm, j: number) => (
              <div key={`name-${algorithm.name}-${j}`}>
                <Param>{algorithm.label || algorithm.name}</Param>
                {algorithm.parameters &&
                  algorithm.parameters.length > 0 &&
                  algorithm.parameters
                    .filter((p: any) => !UI_HIDDEN_PARAMETERS.includes(p.label))
                    .map((m: any, i: number) => (
                      <Param key={`parameters-${algorithm.name}-${i}`}>
                        {m.label}: {m.value}
                      </Param>
                    ))}
              </div>
            ))}
          </>
        }
      </>
    )) ||
    null
  );
};

export default Algorithms;
