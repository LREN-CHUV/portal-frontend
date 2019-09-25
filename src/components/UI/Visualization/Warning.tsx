import React from 'react';
import styled from 'styled-components';

const Warning = styled.div`
  h3 {
    margin: 0;
    font-size: 16px;
    color: rgb(240, 173, 78);
  }
`;

export default ({ message }: { message: any }): JSX.Element => (
  <Warning>
    <h3>A problem has occured</h3>
    <p>{message}</p>
  </Warning>
);
