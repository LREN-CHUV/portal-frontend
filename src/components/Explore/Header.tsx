import * as React from 'react';
import { Button, Card } from 'react-bootstrap';

interface Props {
  handleGoToAnalysis: any;
}
export default ({ handleGoToAnalysis }: Props) => {
  return (
    <Card>
      <Card.Body>
        <Button variant="primary" type="submit" onClick={handleGoToAnalysis}>
          Descriptive Analysis {/* <Glyphicon glyph="chevron-right" /> */}
        </Button>
      </Card.Body>
    </Card>
  );
};
