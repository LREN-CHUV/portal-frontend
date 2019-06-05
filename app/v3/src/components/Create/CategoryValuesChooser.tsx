import * as React from 'react';
import { Col, Form, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { Query } from '../API/Model';

const handleChangeCategory = (event: any, code: string) => {};
const handleChangeValue = (event: any, code: string) => {};

interface Props {
  categoricalVariables?: any;
}
export default ({ categoricalVariables }: Props) => (
  <>
    <pre>{JSON.stringify(categoricalVariables, null, 4)}</pre>
    <FormControl
      componentClass='select'
      placeholder='select'
      //   defaultValue={parameter.value || parameter.default_value}
      // tslint:disable-next-line jsx-no-lambda
      onChange={event => handleChangeCategory(event, 'parameter.code')}
    />
    <FormControl
      componentClass='select'
      placeholder='select'
      //   defaultValue={parameter.value || parameter.default_value}
      // tslint:disable-next-line jsx-no-lambda
      onChange={event => handleChangeValue(event, 'parameter.code')}
    />
  </>
);
