import * as React from 'react';
import { Button, Panel } from 'react-bootstrap';
import styled from 'styled-components';

const PanelBody = styled(Panel.Body)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

interface Props {
  handleNewArticle: () => void;
}
export default ({ handleNewArticle }: Props) => {
  return (
    <Panel>
      <PanelBody>
        <h3 style={{ flex: 1 }}>Articles</h3>
        <Button bsStyle='info' type='submit' onClick={handleNewArticle}>
          New article
        </Button>
      </PanelBody>
    </Panel>
  );
};
