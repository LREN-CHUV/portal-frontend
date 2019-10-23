import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { Algorithm, VariableEntity, AlgorithmParameter } from '../API/Core';
import { ModelResponse } from '../API/Model';

interface AvailableAlgorithm extends Algorithm {
  enabled: boolean;
}

const AvailableAlgorithms = ({
  algorithms,
  lookup,
  handleSelectMethod,
  model
}: {
  algorithms: Algorithm[] | undefined;
  lookup: (code: string) => VariableEntity;
  handleSelectMethod: (method: Algorithm) => void;
  model: ModelResponse | undefined;
}): JSX.Element => {
  const query = model && model.query;
  const modelVariable =
    (query && query.variables && query.variables.map(v => lookup(v.code))) ||
    [];
  const modelCovariables = [
    ...((query &&
      query.coVariables &&
      query.coVariables.map(v => lookup(v.code))) ||
      []),
    ...((query &&
      query.groupings &&
      query.groupings.map(v => lookup(v.code))) ||
      [])
  ];

  const algorithmEnabled = (
    parameters: AlgorithmParameter[],
    { x, y }: { x: VariableEntity[]; y: VariableEntity[] }
  ): boolean => {
    const checkSelectedVariables = (
      axis: string,
      variables: VariableEntity[]
    ): boolean => {
      const definition = parameters.find(p => p.name === axis);
      if (definition) {
        const isCategorical =
          definition.columnValuesIsCategorical === ''
            ? undefined
            : definition.columnValuesIsCategorical === 'true'
            ? true
            : false;
        // const type = xDefinition.columnValuesSQLType;
        // const multiple = definition.valueMultiple;
        const notBlank = definition.valueNotBlank;

        if (isCategorical && !variables.every(c => c.isCategorical)) {
          return false;
        }

        if (!isCategorical && variables.some(c => c.isCategorical)) {
          return false;
        }

        if (notBlank && variables.length === 0) {
          return false;
        }

        // FIXME: not sure if it MUST or SHOULD be multiple
        // Guessing SHOULD now
        // if (multiple && variables.length <= 1) {
        //   return false;
        // }

        return true;
      }

      return true;
    };
    // Independant variable check
    return checkSelectedVariables('x', x) && checkSelectedVariables('y', y);
  };

  const availableAlgorithms: AvailableAlgorithm[] =
    (algorithms &&
      algorithms.map(algorithm => ({
        ...algorithm,
        enabled: algorithmEnabled(algorithm.parameters, {
          x: modelCovariables,
          y: modelVariable
        })
      }))) ||
    [];

  const types = Array.from(
    new Set(availableAlgorithms.map(f => f.type).flat(1))
  );

  console.log(types);
  return (
    <React.Fragment>
      {types.map(type => (
        <div className="method" key={type}>
          <h4>{type}</h4>
          {availableAlgorithms
            .filter(a => a.type && a.type === type)
            .map(algorithm => (
              <div className="method" key={algorithm.code}>
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Popover
                      id={`tooltip-${algorithm.code}`}
                    >{`${algorithm.desc}`}</Popover>
                  }
                >
                  <Button
                    key={algorithm.code}
                    bsStyle="link"
                    // ts lint:disable-next-line jsx-no-lambda
                    onClick={() => handleSelectMethod(algorithm)}
                    style={{
                      color: algorithm.enabled ? '#03a9f4' : 'gray',
                      padding: 0,
                      textTransform: 'none'
                    }}
                    // disabled={!algorithm.enabled}
                  >
                    {algorithm.name}
                  </Button>
                </OverlayTrigger>
              </div>
            ))}
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableAlgorithms;
