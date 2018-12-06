import { MIP } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";

const Methods = ({
  experiment
}: {
  experiment: MIP.API.IExperimentResult | undefined;
}) => {
  const algorithms = experiment && experiment.algorithms;
  const validations = experiment && experiment.validations;

  return (
    (algorithms && validations && (
      <Panel>
        <Panel.Title>
          <h3>Methods</h3>
        </Panel.Title>
        <Panel.Body>
          {algorithms.map((algorithm: any) => (
            <div>
              <p key={algorithm.code}>
                <strong>{algorithm.name}</strong>
              </p>
              {algorithm.parameters && algorithm.parameters.length > 0 && (
                <h3>Parameters</h3>
              )}
              {algorithm.parameters &&
                algorithm.parameters.length > 0 &&
                algorithm.parameters.map((m: any) => (
                  <p key={algorithm.code}>
                    {m.code}: {m.value}
                  </p>
                ))}
            </div>
          ))}
          {validations.length > 0 && <h3>Validation</h3>}
          {validations.length > 0 &&
            validations.map((m: any) => (
              <p key={m.code}>
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
