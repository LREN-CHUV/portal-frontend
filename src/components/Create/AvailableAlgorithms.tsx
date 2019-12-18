import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { Algorithm, VariableEntity, AlgorithmParameter } from '../API/Core';
import { ModelResponse } from '../API/Model';
import styled from 'styled-components';
import { Engine } from '../API/Experiment';
interface AvailableAlgorithm extends Algorithm {
  enabled: boolean;
}

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
        const multiple = definition.valueMultiple;
        const notBlank = definition.valueNotBlank;

        if (isCategorical && !variables.every(c => c.isCategorical)) {
          return false;
        }

        if (isCategorical === false && variables.some(c => c.isCategorical)) {
          return false;
        }

        if (notBlank && variables.length === 0) {
          return false;
        }

        // FIXME: not sure if it MUST or SHOULD be multiple
        // Guessing SHOULD now
        if (!multiple && variables.length > 1) {
          return false;
        }

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
        enabled:
          algorithm.engine === Engine.Workflow
            ? true
            : algorithmEnabled(algorithm.parameters as AlgorithmParameter[], {
                x: modelCovariables,
                y: modelVariable
              })
      }))) ||
    [];

  const variablesHelpMessage = (algorithm: Algorithm): JSX.Element => {
    const message: JSX.Element[] = [];

    const helpFor = (axis: string, term: string): void => {
      const variable = (algorithm.parameters as AlgorithmParameter[]).find(
        p => p.name === axis
      );
      if (variable) {
        if (variable.desc) {
          message.push(
            <p key={`${algorithm.name}-${axis}-desc`}>
              <strong>{term}</strong>: {variable.desc}
            </p>
          );
        } else {
          message.push(
            <p key={`${algorithm.name}-${axis}-desc`}>
              <strong>{term}</strong>
            </p>
          );
        }

        const isCategorical =
          variable.columnValuesIsCategorical === ''
            ? undefined
            : variable.columnValuesIsCategorical === 'true'
            ? true
            : false;

        let multipleconstraint = '';
        if (!variable.valueMultiple) {
          multipleconstraint = ', one var max';
        } else {
          multipleconstraint = ', multiple vars';
        }

        if (isCategorical) {
          message.push(
            <p key={`${algorithm.name}-${axis}-1`}>
              - hint: should be multinominal{multipleconstraint}
            </p>
          );
        } else if (isCategorical === false) {
          message.push(
            <p key={`${algorithm.name}-${axis}-2`}>
              - hint: should be continous{multipleconstraint}
            </p>
          );
        } else if (!isCategorical) {
          message.push(
            <p key={`${algorithm.name}-${axis}-3`}>
              - hint: can be either multinominal or continuous
              {multipleconstraint}
            </p>
          );
        }
      }
    };

    helpFor('y', 'Variable (dependant)');
    helpFor('x', 'Covariable (independant)');

    return <>{message}</>;
  };

  const Container = styled.div`
    var::after {
      content: ', ';
    }

    var::last-child::after {
      content: '';
    }

    p {
      margin: 0;
      padding: 0;
      border: 1px solid transparent;
    }
  `;

  // const PLongMethodName = styled.p`
  //   margin: 0 0 8px 0;
  //   overflow: wrap;
  //   width: 220px;
  //   word-wrap: break-word;
  //   display: inline-block;
  // `;

  return (
    <Container>
      {availableAlgorithms.map(algorithm => (
        <OverlayTrigger
          key={algorithm.name}
          placement="left"
          rootClose={false}
          overlay={
            <Popover id={`tooltip-${algorithm.name}`}>
              <h4>{algorithm.name}</h4>
              <p>{algorithm.desc}</p>
              {algorithm.engine === Engine.Workflow
                ? ''
                : variablesHelpMessage(algorithm)}
            </Popover>
          }
        >
          {layout !== 'inline' ? (
            <div>
              {algorithm.enabled && (
                <Button
                  key={algorithm.name}
                  bsStyle="link"
                  // ts lint:disable-next-line jsx-no-lambda
                  onClick={(): void => handleSelectMethod(algorithm)}
                  disabled={!algorithm.enabled}
                  style={{
                    color: algorithm.enabled ? '#03a9f4' : 'gray',
                    padding: 0,
                    textTransform: 'none'
                  }}
                >
                  {algorithm.name}
                </Button>
              )}
              {!algorithm.enabled && (
                <p
                  key={algorithm.name}
                  style={{
                    color: algorithm.enabled ? '#03a9f4' : 'gray',
                    padding: 0,
                    textTransform: 'none'
                  }}
                >
                  {algorithm.name}
                </p>
              )}
            </div>
          ) : (
            <var
              key={algorithm.name}
              style={{
                color: algorithm.enabled ? '#03a9f4' : 'gray',
                padding: 0,
                textTransform: 'none'
              }}
            >
              {algorithm.name}
            </var>
          )}
        </OverlayTrigger>
      ))}
    </Container>
  );
};
export default AvailableAlgorithms;
