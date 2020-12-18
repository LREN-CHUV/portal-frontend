import * as React from 'react';
import styled from 'styled-components';

import { IExperiment, ExperimentParameter } from '../API/Experiment';
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
  experiment?: IExperiment;
}): JSX.Element | null => {
  const algorithm = experiment?.algorithm;

  return (
    <>
      <h4>Algorithm</h4>
      {algorithm && (
        <>
          <Param>{algorithm.label || algorithm.name}</Param>
          {algorithm.parameters &&
            algorithm.parameters.length > 0 &&
            algorithm.parameters
              .filter(p => !UI_HIDDEN_PARAMETERS.includes(p.label))
              .map((m: ExperimentParameter, i: number) => (
                <Param key={`parameters-${algorithm.name}-${i}`}>
                  {m.label}: {m.value}
                </Param>
              ))}
        </>
      )}
    </>
  );
};

export default Algorithms;
