import * as React from 'react';
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

interface Props {
  apiCore: APICore;
  method?: any;
  parameters?: [AlgorithmParameter];
  query?: Query;
  handleChangeParameters: (parameters: any) => void;
}
class Parameters extends React.Component<Props> {
  public render() {
    const { apiCore, method, parameters, query } = this.props;

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
                const type = numberTypes.includes(parameter.type)
                  ? 'number'
                  : 'text';
                const { constraints } = parameter;

                return (
                  <FormGroup
                    validationState={this.getValidationState(parameter)}
                    key={parameter.code}
                    style={{
                      display:
                        parameter.visible === undefined || parameter.visible
                          ? 'inline'
                          : 'none'
                    }}
                  >
                    <Row>
                      <Col sm={12}>{parameter.description}</Col>
                    </Row>
                    <Row>
                      <Col sm={6}>{parameter.label}</Col>
                      <Col sm={6}>
                        {parameter.type !== 'enumeration' &&
                          parameter.type !== 'referencevalues' && (
                            <FormControl
                              type={type}
                              defaultValue={
                                parameter.value || parameter.default_value
                              }
                              // tslint:disable-next-line jsx-no-lambda
                              onChange={event =>
                                this.handleChangeParameter(
                                  event,
                                  parameter.code
                                )
                              }
                            />
                          )}

                        {parameter.type === 'referencevalues' && (
                          <CategoryChooser
                            apiCore={apiCore}
                            query={query}
                            code={parameter.code}
                            handleChangeCategoryParameter={
                              this.handleChangeCategoryParameter
                            }
                          />
                        )}

                        {parameter.type === 'enumeration' && (
                          <FormControl
                            componentClass="select"
                            placeholder="select"
                            defaultValue={
                              parameter.value || parameter.default_value
                            }
                            // tslint:disable-next-line jsx-no-lambda
                            onChange={event =>
                              this.handleChangeParameter(event, parameter.code)
                            }
                          >
                            {parameter.values &&
                              parameter.values.map((v: any) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                          </FormControl>
                        )}

                        <FormControl.Feedback />
                        <HelpBlock>
                          {constraints && constraints.required && 'required '}
                          {constraints &&
                            constraints.min >= 0 &&
                            'min: ' + constraints.min}
                          {constraints &&
                            constraints.min >= 0 &&
                            constraints.max >= 0 &&
                            ', '}
                          {constraints &&
                            constraints.max >= 0 &&
                            'max: ' + constraints.max}
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
  }

  private getValidationState = (params: any) => {
    const { constraints, code } = params;
    const { parameters } = this.props;
    if (constraints && parameters) {
      const { min, max } = constraints;
      const parameter = parameters.find(
        (p: AlgorithmParameter) => p.code === code
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

  private handleChangeCategoryParameter = (code: string, value: string) => {
    const currentParameters = this.props.parameters;
    if (currentParameters && currentParameters.length) {
      const o = (element: any) => element.code === code;
      const index = currentParameters.findIndex(o);
      const parameter = currentParameters.find(o);
      if (parameter) {
        parameter.value = value;
        currentParameters.splice(index, 1, parameter);
        this.props.handleChangeParameters(currentParameters);
      }
    }
  };

  private handleChangeParameter = (event: any, code: string) => {
    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLInputElement;
    this.handleChangeCategoryParameter(code, currentTarget.value);
  };
}

export default Parameters;
