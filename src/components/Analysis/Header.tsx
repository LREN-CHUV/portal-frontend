import * as React from 'react';
import { Button, FormControl, Card } from 'react-bootstrap';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';
import { ModelResponse } from '../API/Model';

interface Props {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
  handleSaveModel: ({ title }: { title: string }) => void;
  model?: ModelResponse;
}
export default class Header extends React.Component<Props> {
  state = {
    modelName: ''
  };

  handleClose = (): void => {
    this.setState({ show: false });
  };

  handleShow = (): void => {
    this.setState({ show: true });
  };

  render(): JSX.Element {
    const { model, handleGoBackToExplore, handleRunAnalysis } = this.props;

    const currentModelName = this.state.modelName;
    const modelNotSaved = model && !model.slug;

    return (
      <Card>
        <Card.Body>
          <Button onClick={handleGoBackToExplore} variant="info" type="submit">
            <BsFillCaretLeftFill /> Variables
          </Button>
          <h3>Descriptive Analysis</h3>
          <div className="item">&nbsp;</div>
          {modelNotSaved && (
            <div className="item">
              <FormControl
                className="item experiment-name"
                type="text"
                placeholder={'Model name'}
                value={currentModelName}
                onChange={this.handleChangeModelName}
                onKeyDown={this.handleKeyPress}
              />
            </div>
          )}
          {modelNotSaved && (
            <div className="item">
              <Button
                onClick={this.handleSaveModel1}
                variant={'info'}
                type="submit"
                disabled={currentModelName === ''}
                title={
                  currentModelName === ''
                    ? 'Please enter a title for your model'
                    : ''
                }
              >
                Save model
              </Button>
            </div>
          )}
          <div className="item">
            <Button
              onClick={handleRunAnalysis}
              variant="info"
              type="submit"
              disabled={modelNotSaved}
              title={
                currentModelName === ''
                  ? 'Please enter a title for your model'
                  : ''
              }
            >
              Run experiment <BsFillCaretRightFill />{' '}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  private handleSaveModel1 = () => {
    const { modelName } = this.state;
    if (!modelName) {
      return;
    }
    const { handleSaveModel } = this.props;
    handleSaveModel({ title: modelName });
  };

  private handleChangeModelName = (event: any) => {
    this.setState({
      modelName: event.target.value
    });
  };
  private handleKeyPress = (event: any) => {
    const code = event.keyCode || event.charCode;
    if (code === 13) {
      event.preventDefault();
      event.stopPropagation();
      this.handleSaveModel1();
    }
  };
}
