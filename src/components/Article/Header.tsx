import * as React from 'react';
import { Button, Card } from 'react-bootstrap';
import styled from 'styled-components';

const PanelBody = styled(Card.Body)`
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
    <Card>
      <PanelBody>
        <h3 style={{ flex: 1 }}>Articles</h3>
        <Button variant="info" type="submit" onClick={handleNewArticle}>
          New article
        </Button>
      </PanelBody>
    </Card>
  );
};
