import React from 'react';
import styled from 'styled-components';

const Error = styled.div`
  h3 {
    margin: 0;
    font-size: 16px;
    color: rgb(217, 83, 79);
  }
`;

export default ({ message }: { message: any }): JSX.Element => (
  <Error>
    <h3>An error has occured</h3>
    <p>{message}</p>
  </Error>
);