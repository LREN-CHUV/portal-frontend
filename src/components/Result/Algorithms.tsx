import * as React from 'react';
import Panel from '../UI/Panel';
import styled from 'styled-components';
import { ENABLED_ALGORITHMS, UI_HIDDEN_PARAMETERS } from '../constants';

import { ExperimentResponse } from '../API/Experiment';
import { AlgorithmParameter } from '../API/Core';

const Param = styled.p`
  margin: 0 0 8px 0;
  overflow: wrap;
`;

const Algorithms = ({ experiment }: { experiment?: ExperimentResponse }) => {
  const algorithms = experiment && experiment.algorithms;

  return (
    (algorithms && (
      <Panel
        title="Algorithm"
        body={
          <>
            {algorithms.map((algorithm: any, j: number) => (
              <div key={`name-${algorithm.code}-${j}`}>
                <strong>{algorithm.name}</strong>
                {algorithm.parameters &&
                  algorithm.parameters.filter(
                    (p: any) => !UI_HIDDEN_PARAMETERS.includes(p.code)
                  ).length > 0 && <h4>Parameters</h4>}
                {algorithm.parameters &&
                  algorithm.parameters.length > 0 &&
                  algorithm.parameters
                    .filter((p: any) => !UI_HIDDEN_PARAMETERS.includes(p.code))
                    .map((m: any, i: number) => (
                      <Param key={`parameters-${algorithm.code}-${i}`}>
                        {m.code}: {m.value}
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
