import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

const PanelBody = styled(Panel.Body)`
  display: flex;
  padding-top: 15px !important;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0px !important;

  h3 {
    flex: 2;
    margin: 0 0 0 16px;
  }
`;

export default (): JSX.Element => {
  return (
    <Panel>
      <PanelBody>
        <h3>User Profile</h3>
      </PanelBody>
    </Panel>
  );
};
