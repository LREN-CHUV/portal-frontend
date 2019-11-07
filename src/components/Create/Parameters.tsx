import React, { useState, useCallback, useEffect } from 'react';
import { VariableEntity } from '../API/Core';
import {
  Col,
  Form,
  FormControl,
  FormGroup,
  HelpBlock as Help,
  Row
} from 'react-bootstrap';
import { APICore } from '../API';
import { Algorithm, AlgorithmParameter } from '../API/Core';
import { Query } from '../API/Model';
import CategoryChooser from './CategoryValuesChooser';
import Select from 'react-select';
import styled from 'styled-components';

type LocalVar = { value: string; label: string }[] | undefined;

interface Props {
  apiCore: APICore;
  algorithm?: Algorithm;
  parameters?: AlgorithmParameter[];
  query?: Query;
  handleChangeParameters: (parameters: AlgorithmParameter[]) => void;
}

const HelpBlock = styled(Help)`
  var:after {
    content: ', ';
  }
  var:last-child:after {
    content: '';
  }
`;

const Parameters = ({
  apiCore,
  algorithm,
  parameters,
  query,
  handleChangeParameters
}: Props): JSX.Element => {
  const [selectedOptions, setSelectedOptions] = useState<any>();
  const [modalities, setModalities] = useState<LocalVar>();

  // TODO effect in Select component
  const lookupCallback = useCallback(apiCore.lookup, []);
  useEffect(() => {
    const categoricalVariables: VariableEntity[] | undefined = query && [
      ...(query.groupings || []),
      ...(query.coVariables || []),
      ...(query.variables || [])
    ];

    const vars =
      categoricalVariables &&
      categoricalVariables
        .map(v => lookupCallback(v.code))
        .filter(v => v.type === 'polynominal' || v.type === 'binominal');

    const first = (vars && vars.length && vars[0]) || undefined;
    if (first && first.enumerations) {
      setModalities(
        first.enumerations.map((v: any) => ({
          value: v.code,
          label: v.label
        }))
      );
    }
  }, [query, lookupCallback]);

  const getValidationState = (parameter: AlgorithmParameter): any => {
    const value = parameter.value;

    const notBlank = parameter.valueNotBlank;
    const valueType = parameter.valueType;

    if (notBlank && !value) {
      return 'error';
    }

    if (valueType === 'integer' && isNaN(parseInt(value))) {
      return 'error';
    }

    return 'success';
  };

  const handleChangeCategoryParameter = (name: string, value: string): void => {
    if (parameters && parameters.length) {
      const o = (element: any) => element.name === name;
      const index = parameters.findIndex(o);
      const parameter = parameters.find(o);
      if (parameter) {
        parameter.value = value;
        parameters.splice(index, 1, parameter);
        handleChangeParameters(parameters);
      }
    }
  };

  const handleChangeParameter = (event: any, name: string): void => {
    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLInputElement;
    handleChangeCategoryParameter(name, currentTarget.value);
  };

  const handleSelect = (options: any): void => {
    setSelectedOptions(options);
    handleChangeCategoryParameter(
      'xlevels',
      options.map((o: any) => o.value).toString()
    );
  };

  return (
    <>
      {!algorithm && (
        <div>
          <h4>
            <strong>Your algorithm</strong>
          </h4>
          <p style={{ color: 'orange' }}>
            Please, select the algorithm to be performed in the &apos;Available
            Algorithms&apos; panel
          </p>
        </div>
      )}
      {algorithm && (
        <div>
          <h4>
            <strong>{algorithm.name}</strong>
          </h4>
          <p>{algorithm.desc}</p>
        </div>
      )}
      {parameters && parameters.filter(p => p.visible).length > 0 && (
        <h4>Parameters</h4>
      )}
      {parameters && parameters.length > 0 && (
        <Form horizontal={true}>
          {parameters &&
            parameters.length &&
            parameters.map((parameter: AlgorithmParameter) => {
              const numberTypes = ['integer', 'real'];
              const type =
                parameter &&
                parameter.valueType &&
                numberTypes.includes(parameter.type)
                  ? 'number'
                  : 'text';

              return (
                <FormGroup
                  validationState={getValidationState(parameter)}
                  key={parameter.name}
                  style={{
                    display:
                      parameter.visible === undefined || parameter.visible
                        ? 'inline'
                        : 'none'
                  }}
                >
                  <Row>
                    <Col sm={12}>{parameter.desc}</Col>
                  </Row>
                  <Row>
                    <Col sm={6}>{parameter.name}</Col>
                    <Col sm={6}>
                      {!parameter.enumeration &&
                        parameter.name !== 'referencevalues' &&
                        parameter.name !== 'xlevels' && (
                          <FormControl
                            type={type}
                            defaultValue={parameter.defaultValue}
                            // tslint:disable-next-line jsx-no-lambda
                            onChange={event =>
                              handleChangeParameter(event, parameter.name)
                            }
                          />
                        )}

                      {parameter.enumeration &&
                        parameter.enumeration.length > 0 && (
                          <FormControl
                            componentClass="select"
                            placeholder="select"
                            defaultValue={parameter.defaultValue}
                            // tslint:disable-next-line jsx-no-lambda
                            onChange={event =>
                              handleChangeParameter(event, parameter.name)
                            }
                          >
                            {parameter.enumeration.map((v: string) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </FormControl>
                        )}

                      {parameter.name === 'xlevels' && (
                        <Select
                          value={selectedOptions}
                          onChange={handleSelect}
                          options={modalities}
                          isMulti={true}
                        />
                      )}

                      {parameter.name === 'referencevalues' && (
                        <CategoryChooser
                          apiCore={apiCore}
                          query={query}
                          parameterName={parameter.name}
                          notblank={parameter.valueNotBlank}
                          handleChangeCategoryParameter={
                            handleChangeCategoryParameter
                          }
                        />
                      )}

                      <FormControl.Feedback />
                      <HelpBlock>
                        {parameter && parameter.valueNotBlank && (
                          <var>Not blank</var>
                        )}
                        {parameter && parameter.valueType === 'integer' && (
                          <var>Integer</var>
                        )}
                      </HelpBlock>
                    </Col>
                  </Row>
                </FormGroup>
              );
            })}
        </Form>
      )}
    </>
  );
};

export default Parameters;
