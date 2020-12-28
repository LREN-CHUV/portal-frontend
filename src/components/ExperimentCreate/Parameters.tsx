import React, { useCallback, useEffect, useState } from 'react';
import { Form, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import styled from 'styled-components';
import { APICore } from '../API';
import { Algorithm, AlgorithmParameter, VariableEntity } from '../API/Core';
import { Query } from '../API/Model';
import CategoryChooser from './CategoryValuesChooser';
import LogisticCategory from './LogisticCategory';

const Header = styled.div`
  margin-bottom: 16px;
`;

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
      const o = (element: any) =>
        element.label === label || element.name === label;
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
          <p>
            Please, select the algorithm to be performed in the &apos;Available
            Algorithms&apos; panel
          </p>
        </div>
      )}

      {algorithm && (
        <Header>
          <h4>
            <strong>{algorithm.label}</strong>
          </h4>
          <p>{algorithm.desc}</p>
        </Header>
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
                <Form.Group
                  key={parameter.name}
                  style={{
                    marginBottom: '16px',
                    display:
                      parameter.visible === undefined || parameter.visible
                        ? 'normal'
                        : 'none'
                  }}
                >
                  <Form.Label htmlFor={`"${parameter.name}"`}>
                    {parameter.label}
                  </Form.Label>
                  <>
                    {!parameter.valueEnumerations &&
                      parameter.label !== 'referencevalues' &&
                      parameter.label !== 'xlevels' &&
                      parameter.label !== 'Positive outcome' &&
                      parameter.label !== 'Negative outcome' &&
                      parameter.name !== 'positive_level' &&
                      parameter.name !== 'negative_level' && (
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
                        parameterName={parameter.name}
                        notblank={parameter.valueNotBlank === 'true'}
                        handleChangeCategoryParameter={
                          handleChangeCategoryParameter
                        }
                      />
                    )}

                    {(parameter.name === 'negative_level' ||
                      parameter.name === 'positive_level') && (
                      <>
                        <LogisticCategory
                          apiCore={apiCore}
                          query={query}
                          parameterName={parameter.name}
                          notblank={parameter.valueNotBlank === 'true'}
                          handleChangeCategoryParameter={
                            handleChangeCategoryParameter
                          }
                        />
                      </>
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

                    <Form.Text id="passwordHelpBlock" muted>
                      {parameter.desc}
                    </Form.Text>

                    <FormControl.Feedback />
                    <HelpBlock>
                      {parameter && parameter.valueNotBlank === 'true' && (
                        <small>required</small>
                      )}
                      {parameter && parameter.valueType === 'integer' && (
                        <small>type integer</small>
                      )}

                      {parameter && parameter.valueType === 'float' && (
                        <small>type float</small>
                      )}

                      {parameter !== undefined &&
                        parameter.valueMin !== undefined &&
                        parameter.valueMin !== null &&
                        !isNaN(parameter.valueMin) && (
                          <small>min value: {parameter.valueMin}</small>
                        )}

                      {parameter !== undefined &&
                        parameter.valueMax !== undefined &&
                        parameter.valueMax !== null &&
                        !isNaN(parameter.valueMax) && (
                          <small>max value: {parameter.valueMax}</small>
                        )}
                    </HelpBlock>
                  </>
                </Form.Group>
              );
            })}
        </Form>
      )}
    </>
  );
};

export default Parameters;
