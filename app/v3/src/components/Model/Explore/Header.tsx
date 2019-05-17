import * as React from 'react';
import { Panel, Button, Glyphicon } from 'react-bootstrap';

interface Props {}
export default class Header extends React.Component<Props> {
  public render() {
    return (
      <Panel>
        <Panel.Body>
          <h3>Epidemiological Exploration</h3>
          <div className='actions status'>
            <div className='item'>
              <Button
                bsStyle='info'
                type='submit'>
                <Glyphicon glyph='chevron-right' /> Interactive Analysis
              </Button>
            </div>
            </div>
        </Panel.Body>
      </Panel>
    );
  }
}
