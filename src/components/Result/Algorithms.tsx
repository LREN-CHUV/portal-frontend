import * as React from 'react';
import styled from 'styled-components';
import { ExperimentResponse } from '../API/Experiment';
import { UI_HIDDEN_PARAMETERS } from '../constants';
import Panel from '../UI/Panel';
import { Algorithm } from '../API/Core';

const Param = styled.p`
  margin: 0 0 8px 0;
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
      <Panel
        title="Algorithm"
        body={
          <>
            {algorithms.map((algorithm: Algorithm, j: number) => (
              <div key={`name-${algorithm.name}-${j}`}>
                <Param>
                  <strong>{algorithm.label || algorithm.name}</strong>
                </Param>
                {algorithm.parameters &&
                  algorithm.parameters.filter(
                    (p: any) => !UI_HIDDEN_PARAMETERS.includes(p.label)
                  ).length > 0 && <h4>Parameters</h4>}
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
      />
    )) ||
    null
  );
};

export default Algorithms;
