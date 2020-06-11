import * as React from 'react';
import { Button, Glyphicon, Panel } from 'react-bootstrap';

interface Props {
  handleGoToAnalysis: any;
}
export default ({ handleGoToAnalysis }: Props) => {
  return (
    <Panel>
      <Panel.Body>
        <Button bsStyle="info" type="submit" onClick={handleGoToAnalysis}>
          Descriptive Analysis <Glyphicon glyph="chevron-right" />
        </Button>
      </Panel.Body>
    </Panel>
  );
};
