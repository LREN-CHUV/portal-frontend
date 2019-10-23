import React, { useState, useCallback, useEffect } from 'react';
import { VariableEntity } from '../API/Core';
import {
  Col,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Row
} from 'react-bootstrap';
import { APICore } from '../API';
import { AlgorithmParameter } from '../API/Core';
import { Query } from '../API/Model';
import CategoryChooser from './CategoryValuesChooser';
import Select from 'react-select';

type LocalVar = { value: string; label: string }[] | undefined;

interface Props {
  apiCore: APICore;
  method?: any;
  parameters?: [AlgorithmParameter];
  query?: Query;
  handleChangeParameters: (parameters: any) => void;
}

const Parameters = ({
  apiCore,
  method,
  parameters,
  query,
  handleChangeParameters
}: Props): JSX.Element => {
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [modalities, setModalities] = useState<LocalVar>();

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

  const getValidationState = (params: any): any => {
    const { constraints, code } = params;
    if (constraints && parameters) {
      const { min, max } = constraints;
      const parameter = parameters.find(
        (p: AlgorithmParameter) => p.name === code
      );
      if (
        (parameter && parameter.value < min) ||
        (parameter && parameter.value > max)
      ) {
        return 'error';
      }

      const required = constraints.required;
      if (required && !(parameter && parameter.value)) {
        return 'error';
      }
    }

    return 'success';
  };

  const handleChangeCategoryParameter = (code: string, value: string): void => {
    if (parameters && parameters.length) {
      const o = (element: any) => element.code === code;
      const index = parameters.findIndex(o);
      const parameter = parameters.find(o);
      if (parameter) {
        parameter.value = value;
        parameters.splice(index, 1, parameter);
        handleChangeParameters(parameters);
      }
    }
  };

  const handleChangeParameter = (event: any, code: string): void => {
    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLInputElement;
    handleChangeCategoryParameter(code, currentTarget.value);
  };

  const handleSelect = (options: any): void => {
    setSelectedOptions(options);
  };

  return (
    <div>
      {method && (
        <div>
          <h4>
            <strong>{method.label}</strong>
          </h4>
          <p>{method.description}</p>
          {/* <pre>{JSON.stringify(method.constraints, null, 4)}</pre> */}
        </div>
      )}
      {!method && (
        <div>
          <h4>
            <strong>Your method</strong>
          </h4>
          <p style={{ color: 'orange' }}>
            Please, select the method to be performed in the &apos;Available
            Methods&apos; panel
          </p>
        </div>
      )}
      {parameters && parameters.length > 0 && <h4>Parameters</h4>}
      {parameters && parameters.length > 0 && (
        <Form horizontal={true}>
          {parameters &&
            parameters.length &&
            parameters.map((parameter: AlgorithmParameter) => {
              const numberTypes = [
                'int',
                'integer',
                'real',
                'number',
                'numeric'
              ];
              const type =
                parameter &&
                parameter.type &&
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
                      {parameter.type !== 'enumeration' &&
                        parameter.type !== 'referencevalues' &&
                        parameter.name !== 'xlevels' && (
                          <FormControl
                            type={type}
                            defaultValue={parameter.value}
                            // tslint:disable-next-line jsx-no-lambda
                            onChange={event =>
                              handleChangeParameter(event, parameter.name)
                            }
                          />
                        )}

                      {parameter.name === 'xlevels' && (
                        <Select
                          value={selectedOptions}
                          onChange={handleSelect}
                          options={modalities}
                          isMulti={true}
                        />
                      )}

                      {parameter.type === 'referencevalues' && (
                        <CategoryChooser
                          apiCore={apiCore}
                          query={query}
                          code={parameter.name}
                          handleChangeCategoryParameter={
                            handleChangeCategoryParameter
                          }
                        />
                      )}

                      {parameter.type === 'enumeration' && (
                        <FormControl
                          componentClass="select"
                          placeholder="select"
                          defaultValue={parameter.value}
                          // tslint:disable-next-line jsx-no-lambda
                          onChange={event =>
                            handleChangeParameter(event, parameter.name)
                          }
                        >
                          {/* {parameter.values &&
                            parameter.values.map((v: any) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))} */}
                        </FormControl>
                      )}

                      <FormControl.Feedback />
                      <HelpBlock>
                        {/* {constraints && constraints.required && 'required '}
                        {constraints &&
                          constraints.min >= 0 &&
                          'min: ' + constraints.min}
                        {constraints &&
                          constraints.min >= 0 &&
                          constraints.max >= 0 &&
                          ', '}
                        {constraints &&
                          constraints.max >= 0 &&
                          'max: ' + constraints.max} */}
                      </HelpBlock>
                    </Col>
                  </Row>
                </FormGroup>
              );
            })}
        </Form>
      )}
    </div>
  );
};

export default Parameters;
