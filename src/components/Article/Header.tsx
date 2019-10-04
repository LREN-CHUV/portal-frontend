import * as React from 'react';
import { Button, Panel } from 'react-bootstrap';
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

interface Props {
  handleNewArticle: () => void;
}
export default ({ handleNewArticle }: Props) => {
  return (
    <Panel>
      <PanelBody>
        <h3 style={{ flex: 1 }}>Articles</h3>
        <Button bsStyle="info" type="submit" onClick={handleNewArticle}>
          New article
        </Button>
      </PanelBody>
    </Panel>
  );
};
