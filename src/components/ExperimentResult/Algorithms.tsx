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
  const isWorkflow = algorithm?.type === 'workflow';
  const paramName = isWorkflow ? 'label' : 'name';

  const parameters =
    (algorithm?.parameters &&
      algorithm.parameters.length > 0 &&
      algorithm.parameters.filter(p => {
        const param = p[paramName];
        if (param) {
          return !UI_HIDDEN_PARAMETERS.includes(param);
        }
        return false;
      })) ||
    [];

  return (
    <>
      <h4>Algorithm</h4>
      {algorithm && (
        <>
          <Param>{algorithm.label || algorithm.name}</Param>
          {parameters.map((p: ExperimentParameter, i: number) => (
            <Param key={`parameters-${algorithm.name}-${i}`}>
              {p.label || p.name}: {p.value}
            </Param>
          ))}
        </>
      )}
    </>
  );
};

export default Algorithms;
