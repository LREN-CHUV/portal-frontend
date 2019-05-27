import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import styled from 'styled-components';

const StyledPanel = styled(Panel)`
  margin-right: 8px;

  &:last-child {
    margin-right: 0;
  }
`;
const PanelFooter = styled(Panel.Footer)``;

export default () => (
  <StyledPanel>
    <Panel.Heading>model-9721</Panel.Heading>
    <Panel.Body />
    <PanelFooter>
      by Manuel Spuhler 19 days ago
    </PanelFooter>
  </StyledPanel>
);
