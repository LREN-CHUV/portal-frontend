import * as React from 'react';
import { Button, Card } from 'react-bootstrap';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';

interface Props {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
}
export default class Header extends React.Component<Props> {
  render(): JSX.Element {
    const { handleGoBackToExplore, handleRunAnalysis } = this.props;

    return (
      <Card>
        <Card.Body>
          <Button
            onClick={handleGoBackToExplore}
            variant="primary"
            type="submit"
          >
            <BsFillCaretLeftFill /> Variables
          </Button>
          <h3>Descriptive Analysis</h3>
          <div className="item">
            <Button onClick={handleRunAnalysis} variant="primary" type="submit">
              Run experiment <BsFillCaretRightFill />{' '}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
}
