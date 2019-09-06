import * as React from 'react';
import { Button, Glyphicon, Panel } from 'react-bootstrap';

interface Props {
  handleGoToAnalysis: any;
}
export default ({ handleGoToAnalysis }: Props) => {
  return (
    <Panel>
      <Panel.Body>
        {/* <h3>Epidemiological Exploration</h3> */}
        <Button bsStyle="info" type="submit" onClick={handleGoToAnalysis}>
          Interactive Analysis <Glyphicon glyph="chevron-right" />
        </Button>
      </Panel.Body>
    </Panel>
  );
};
