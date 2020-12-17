import React, { useCallback, useEffect, useState } from 'react';
import { APICore } from '../API';
import { Query } from '../API/Model';
import { Col, Form, FormControl, FormGroup, Row } from 'react-bootstrap';

interface Props {
  apiCore: APICore;
  parameterName: string;
  query?: Query;
  handleChangeCentersParameter: any;
}
export default ({
  apiCore,
  query,
  parameterName,
  handleChangeCentersParameter
}: Props): JSX.Element => {
  const variables = (query && query.variables) || [];

  return (
    <>
      {variables.map((c1, i) => (
        <div key={c1.code}>
          <Col sm={12}>
            {variables.map((c2, i) => (
              <FormControl
                key={c2.code}
                type="number"
                // tslint:disable-next-line jsx-no-lambda
                placeholder={c2.code}
                onChange={event => handleChangeCentersParameter()}
              />
            ))}
          </Col>
        </div>
      ))}
    </>
  );
};
