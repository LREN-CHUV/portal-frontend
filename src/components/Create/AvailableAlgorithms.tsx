import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { Algorithm, VariableEntity, AlgorithmParameter } from '../API/Core';
import { ModelResponse } from '../API/Model';
import styled from 'styled-components';
interface AvailableAlgorithm extends Algorithm {
  enabled: boolean;
}

const InlineAlgorithms = styled.div`
  var::after {
    content: ', ';
  }

  var::last-child::after {
    content: '';
  }
`;

const AvailableAlgorithms = ({
  algorithms,
  lookup,
  layout = 'default',
  handleSelectMethod,
  model
}: {
  algorithms: Algorithm[] | undefined;
  layout?: string;
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
        enabled: algorithmEnabled(
          algorithm.parameters as AlgorithmParameter[],
          {
            x: modelCovariables,
            y: modelVariable
          }
        )
      }))) ||
    [];

  const types = Array.from(
    new Set(availableAlgorithms.map(f => f.type).flat(1))
  );

  const variablesHelpMessage = (algorithm: Algorithm): JSX.Element => {
    const message: JSX.Element[] = [];

    const helpFor = (axis: string, term: string): void => {
      const variable = (algorithm.parameters as AlgorithmParameter[]).find(
        p => p.name === axis
      );
      if (variable) {
        const isCategorical =
          variable.columnValuesIsCategorical === ''
            ? undefined
            : variable.columnValuesIsCategorical === 'true'
            ? true
            : false;

        if (isCategorical) {
          message.push(<p>{term} should be multinominal</p>);
        }

        if (isCategorical === false) {
          message.push(<p>{term} should be continous</p>);
        }
      }
    };

    helpFor('x', 'Covariable (independant)');
    helpFor('y', 'Variable (dependant)');

    return <>{message}</>;
  };

  return (
    <>
      {layout !== 'inline' &&
        types.map(type => (
          <div className="method" key={type}>
            <h4>{type}</h4>
            {availableAlgorithms
              .filter(a => a.type && a.type === type)
              .map(algorithm => (
                <div className="method" key={algorithm.code}>
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Popover id={`tooltip-${algorithm.code}`}>
                        <p>{algorithm.desc}</p>
                        {!algorithm.enabled && variablesHelpMessage(algorithm)}
                      </Popover>
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
      {layout === 'inline' && (
        <InlineAlgorithms>
          {availableAlgorithms.map(algorithm => (
            <span className="method" key={algorithm.code}>
              <OverlayTrigger
                placement="left"
                overlay={
                  <Popover id={`tooltip-${algorithm.code}`}>
                    <p>{algorithm.desc}</p>
                    {!algorithm.enabled && variablesHelpMessage(algorithm)}
                  </Popover>
                }
              >
                <var
                  key={algorithm.code}
                  style={{
                    color: algorithm.enabled ? '#449d44' : 'gray',
                    padding: 0,
                    textTransform: 'none'
                  }}
                >
                  {algorithm.name}
                </var>
              </OverlayTrigger>
            </span>
          ))}
        </InlineAlgorithms>
      )}
    </>
  );
};
export default AvailableAlgorithms;
