import { MIP } from "@app/types";
import * as React from "react";
import {
  Col,
  Form,
  FormControl,
  FormGroup,
  HelpBlock
} from "react-bootstrap"; 


interface IProps {
  method?: any;
  parameters?: [MIP.API.IMethodPayload];
  kfold?: number;
  handleChangeParameters: (parameters: any) => void;
  handleChangeKFold: (kfold: number) => void;
}
class FForm extends React.Component<IProps> {

  public render() {
    const {  method, parameters } = this.props;
    const isPredictiveMethod =
      (method && method.type[0] === "predictive_model") || false;

    return (
      <div>
        {method && (
          <div>
            <h4>
              <strong>{method.label}</strong>
            </h4>
            <p>{method.description}</p>
          </div>
        )}
        {!method && (
          <div>
            <h4>
              <strong>Your method</strong>
            </h4>
            <p>Please, select a method on the right pane</p>
          </div>
        )}

        {this.props.children}

        {isPredictiveMethod && 
          <Form horizontal={true}>
            <FormGroup validationState={this.getKFoldValidationState()}
              key={'kfold'}>
              <Col sm={2}>K-Fold:</Col>
              <Col sm={4}>
                <FormControl
                  defaultValue={"2"}
                  type="number"
                  onChange={this.handleChangeKFold}
                />
<HelpBlock>
                  min: 2, max 20
                </HelpBlock>
                <FormControl.Feedback />
              </Col>
              <Col sm={6}>Defines the number of folds used in the cross-validation. Typical numbers are 5 or 10. More information: <a target="_blank" href="https://en.wikipedia.org/wiki/Cross-validation_(statistics)">https://en.wikipedia.org/wiki/Cross-validation_(statistics)</a></Col>
            </FormGroup>
            </Form>
          }
          
        {parameters && parameters.length > 0 && <h4>Parameters</h4>}
        {parameters && parameters.length > 0 && 
          <Form horizontal={true}>
            {parameters && parameters.length && parameters.map((parameter: MIP.API.IMethodPayload) => {
              const numberTypes = ["int", "real", "number", "numeric"];
              const type =
                numberTypes.indexOf(parameter.type) >= -1 ? "number" : "text";
              const { constraints } = parameter;

              return (
                <FormGroup
                  validationState={this.getValidationState(parameter)}
                  key={parameter.code}
                >
                  <Col sm={2}>{parameter.label}</Col>
                  <Col sm={4}>
                    {parameter.type !== "enumeration" && (
                      <FormControl
                        type={type}
                        defaultValue={parameter.value || parameter.default_value}
                        // tslint:disable-next-line jsx-no-lambda
                        onChange={event =>
                          this.handleChangeParameter(event, parameter.code)
                        }
                      />
                    )}
                    {parameter.type === "enumeration" && (
                      <FormControl
                        componentClass="select"
                        placeholder="select"
                        defaultValue={parameter.value || parameter.default_value}
                        // tslint:disable-next-line jsx-no-lambda
                        onChange={event =>
                          this.handleChangeParameter(event, parameter.code)
                        }
                      >
                        {parameter.values && parameter.values.map((v: any) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </FormControl>
                    )}
                    <FormControl.Feedback />
                    <HelpBlock>
                      {constraints &&
                        constraints.min >= 0 &&
                        "min: " + constraints.min}
                      {constraints &&
                        constraints.min >= 0 &&
                        constraints.max >= 0 &&
                        ", "}
                      {constraints &&
                        constraints.max >= 0 &&
                        "max: " + constraints.max}
                    </HelpBlock>
                  </Col>
                  <Col sm={6}>{parameter.description}</Col>
                </FormGroup>
              );
            })}
          </Form>
        }
      </div>
    );
  }

  private getValidationState = (params: any) => {
    const { constraints, code } = params;
    const { parameters } = this.props;
    if (constraints && parameters) {
      const { min, max } = constraints;
      const parameter = parameters.find((p: MIP.API.IMethodPayload) => p.code === code);
      if (parameter && parameter.value < min || parameter && parameter.value > max) {
        
        return "error";
      }
    }

    return "success";
  };

  private getKFoldValidationState = () => {
    const { kfold } = this.props;
    if (!kfold) {
      return 'success'
    }
    return kfold && kfold > 1 ? 'success' : 'error' 
  }

  private handleChangeKFold = (event: any) => {
    event.preventDefault();
    const kfold = event.target.value
    this.props.handleChangeKFold(kfold)
  }

  private handleChangeParameter = (event: any, code: string) => {
    event.preventDefault();
    const currentParameters = this.props.parameters;
    if (currentParameters && currentParameters.length) {
    const o = (element: any) => element.code === code
    const index = currentParameters.findIndex(o)
    const parameter = currentParameters.find(o)
    if (parameter) {
      parameter.value = event.target.value;
     currentParameters.splice(index, 1, parameter);
    this.props.handleChangeParameters(currentParameters);
    }}
  };

  
}

export default FForm;
