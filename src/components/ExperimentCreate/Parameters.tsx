import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import styled from 'styled-components';
import { APICore } from '../API';
import { Algorithm, AlgorithmParameter, VariableEntity } from '../API/Core';
import { Query } from '../API/Model';
import CategoryChooser from './CategoryValuesChooser';
import LogisticCategory from './LogisticCategory';

type LocalVar = { value: string; label: string }[] | undefined;

interface Props {
  apiCore: APICore;
  algorithm?: Algorithm;
  parameters?: AlgorithmParameter[];
  query?: Query;
  handleChangeParameters: (parameters: AlgorithmParameter[]) => void;
}

const Header = styled.div`
  margin-bottom: 16px;

  h4 {
    margin-bottom: 4px;
  }
`;

const HelpBlock = styled.div`
  var {
    color: #6c757d;
    display: inline;
    font-size: 0.8em;
    font-weight: 400;
  }

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
  const [validated, setValidated] = useState(false);

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

  const handleSubmit = (event: Record<string, any>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  return (
    <>
      {!algorithm && (
        <Header>
          <h4>
            <strong>Your algorithm</strong>
          </h4>
          <p>
            Please, select the algorithm to be performed in the &apos;Available
            Algorithms&apos; panel
          </p>
        </Header>
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
        <Form
          noValidate
          validated={validated}
          onLoad={handleSubmit}
          onChange={handleSubmit}
        >
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
              const step = parameter.valueType === 'real' ? 0.01 : 1;

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
                          required={parameter.valueNotBlank === 'true'}
                          min={parameter.valueMin}
                          max={parameter.valueMax}
                          step={step}
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
                          required={parameter.valueNotBlank === 'true'}
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
                        required={parameter.valueNotBlank === 'true'}
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
                          required={parameter.valueNotBlank === 'true'}
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
                        required={parameter.valueNotBlank === 'true'}
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

                    <HelpBlock>
                      {parameter && parameter.valueNotBlank === 'true' && (
                        <var>required</var>
                      )}
                      {parameter && parameter.valueType === 'integer' && (
                        <var>type integer</var>
                      )}

                      {parameter && parameter.valueType === 'real' && (
                        <var>type real</var>
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
