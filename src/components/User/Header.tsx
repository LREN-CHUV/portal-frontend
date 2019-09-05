import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

const PanelBody = styled(Panel.Body)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export default () => {
  return (
    <Panel>
      <PanelBody>
        <h3>User Infos</h3>
      </PanelBody>
    </Panel>
  );
};
