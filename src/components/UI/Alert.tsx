import * as React from 'react';
import { Alert as BSAlert } from 'react-bootstrap';
import styled from 'styled-components';
export interface IAlert {
  message?: string;
  styled?: string;
  title?: string;
}

const Box = styled(BSAlert)`
  position: relative !important;
`;

export const Alert = ({ message, styled, title }: IAlert): JSX.Element | null =>
  (message && (
    <Box variant={styled || 'danger'}>
      <h4>{title || 'Error'}</h4>
      <p>{message}</p>
    </Box>
  )) ||
  null;
