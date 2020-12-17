import * as React from 'react';
import { Button, Card } from 'react-bootstrap';

interface Props {
  handleGoToAnalysis: any;
}
export default ({ handleGoToAnalysis }: Props): JSX.Element => {
  return (
    <Card>
      <Card.Body>
        <Button variant="info" type="submit" onClick={handleGoToAnalysis}>
          Descriptive Analysis {/* <Glyphicon glyph="chevron-right" /> */}
        </Button>
      </Card.Body>
    </Card>
  );
};
