import * as React from 'react';
import { Button, Glyphicon, Panel } from 'react-bootstrap';

export default () => {
  return (
    <Panel>
      <Panel.Body>
        {/* <h3>Epidemiological Exploration</h3> */}
        <Button bsStyle='info' type='submit'>
          Interactive Analysis <Glyphicon glyph='chevron-right' />
        </Button>
      </Panel.Body>
    </Panel>
  );
};
