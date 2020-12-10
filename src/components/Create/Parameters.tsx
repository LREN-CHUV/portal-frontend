import React, { useCallback, useEffect, useState } from 'react';
import { Col, Form, FormControl, FormGroup, Row } from 'react-bootstrap';
import Select from 'react-select';
import styled from 'styled-components';

import { APICore } from '../API';
import { Algorithm, AlgorithmParameter, VariableEntity } from '../API/Core';
import { Query } from '../API/Model';
import CategoryChooser from './CategoryValuesChooser';

type LocalVar = { value: string; label: string }[] | undefined;

interface Props {
  apiCore: APICore;
  algorithm?: Algorithm;
  parameters?: AlgorithmParameter[];
  query?: Query;
  handleChangeParameters: (parameters: AlgorithmParameter[]) => void;
}

const HelpBlock = styled.div`
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
        .map(v => lookupCallback(v.code, query?.pathology))
        .filter(v => v.type === 'multinominal' || v.type === 'binominal');

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
    const valueMin = parameter.valueMin;
    const valueMax = parameter.valueMax;

    if (notBlank && !value) {
      return 'error';
    }

    if (valueType === 'integer' && isNaN(parseInt(value))) {
      return 'error';
    }

    if (valueMin && parseInt(value) < valueMin) {
      return 'error';
    }

    if (valueMax && parseInt(value) > valueMax) {
      return 'error';
    }

    return 'success';
  };

  const handleChangeCategoryParameter = (
    label: string,
    value: string
  ): void => {
    if (parameters && parameters.length) {
      const o = (element: any) => element.label === label;
      const index = parameters.findIndex(o);
      const parameter = parameters.find(o);
      if (parameter) {
        parameter.value = value;
        parameters.splice(index, 1, parameter);
        handleChangeParameters(parameters);
      }
    }
  };

  const handleChangeParameter = (event: any, label: string): void => {
    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLInputElement;
    handleChangeCategoryParameter(label, currentTarget.value);
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
            <strong>{algorithm.label}</strong>
          </h4>
          <p>{algorithm.desc}</p>
        </div>
      )}
      {parameters && parameters.filter(p => p.visible).length > 0 && (
        <h4>Parameters</h4>
      )}
      {parameters && parameters.length > 0 && (
        <Form>
          {parameters &&
            parameters.length &&
            parameters.map((parameter: AlgorithmParameter) => {
              const numberTypes = ['integer', 'real'];
              const type =
                parameter &&
                parameter.valueType &&
                numberTypes.includes(parameter.valueType)
                  ? 'number'
                  : 'text';

              return (
                <FormGroup
                  key={parameter.label}
                  style={{
                    display:
                      parameter.visible === undefined || parameter.visible
                        ? 'inline'
                        : 'none'
                  }}
                >
                  <p>{parameter.desc}</p>
                  <p>{parameter.label}</p>
                  <div>
                    {!parameter.valueEnumerations &&
                      parameter.label !== 'referencevalues' &&
                      parameter.label !== 'xlevels' &&
                      parameter.label !== 'Positive outcome' &&
                      parameter.label !== 'Negative outcome' && (
                        <Form.Control
                          type={type}
                          defaultValue={parameter.defaultValue}
                          placeholder={parameter.placeholder}
                          // tslint:disable-next-line jsx-no-lambda
                          onChange={event =>
                            handleChangeParameter(event, parameter.label)
                          }
                        />
                      )}

                    {console.log(parameter.valueEnumerations)}
                    {parameter.valueEnumerations &&
                      parameter.valueEnumerations.length > 0 && (
                        <Form.Control
                          as={'select'}
                          defaultValue={parameter.defaultValue}
                          placeholder={parameter.placeholder}
                          // tslint:disable-next-line jsx-no-lambda
                          onChange={event =>
                            handleChangeParameter(event, parameter.label)
                          }
                        >
                          {parameter.valueEnumerations.map((v: string) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </Form.Control>
                      )}

                    {parameter.label === 'xlevels' && (
                      <Select
                        value={selectedOptions}
                        onChange={handleSelect}
                        options={modalities}
                        isMulti={true}
                      />
                    )}

                    {parameter.label === 'referencevalues' && (
                      <CategoryChooser
                        apiCore={apiCore}
                        query={query}
                        parameterName={parameter.label}
                        notblank={parameter.valueNotBlank === 'true'}
                        handleChangeCategoryParameter={
                          handleChangeCategoryParameter
                        }
                      />
                    )}

                    {(parameter.label === 'Positive outcome' ||
                      parameter.label === 'Negative outcome') && (
                      <Form.Control
                        defaultValue={parameter.defaultValue}
                        placeholder={parameter.placeholder}
                        // tslint:disable-next-line jsx-no-lambda
                        onChange={event =>
                          handleChangeParameter(event, parameter.label)
                        }
                      >
                        {apiCore
                          .lookup(
                            query?.variables?.find((v, i) => i === 0)?.code ||
                              '',
                            query?.pathology
                          )
                          ?.enumerations?.map((v: VariableEntity) => (
                            <option key={v.code} value={v.code}>
                              {v.label}
                            </option>
                          ))}
                      </Form.Control>
                    )}

                    <FormControl.Feedback />
                    <HelpBlock>
                      {parameter && parameter.valueNotBlank && (
                        <var>required</var>
                      )}
                      {parameter && parameter.valueType === 'integer' && (
                        <var>type integer</var>
                      )}

                      {parameter && parameter.valueType === 'float' && (
                        <var>type float</var>
                      )}

                      {parameter !== undefined &&
                        parameter.valueMin !== undefined &&
                        parameter.valueMin !== null &&
                        !isNaN(parameter.valueMin) && (
                          <var>min value: {parameter.valueMin}</var>
                        )}

                      {parameter !== undefined &&
                        parameter.valueMax !== undefined &&
                        parameter.valueMax !== null &&
                        !isNaN(parameter.valueMax) && (
                          <var>max value: {parameter.valueMax}</var>
                        )}
                    </HelpBlock>
                  </div>
                </FormGroup>
              );
            })}
        </Form>
      )}
    </>
  );
};

export default Parameters;
