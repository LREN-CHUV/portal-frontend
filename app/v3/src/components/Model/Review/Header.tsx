import * as React from 'react';
import { Button, FormControl, Glyphicon, Panel } from 'react-bootstrap';
import { ModelResponse } from '../../API/Model';

interface Props {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
  handleSaveModel: ({ title }: { title: string }) => void;
  model?: ModelResponse;
}
export default class Header extends React.Component<Props> {
  public state: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      modelName: ''
    };
  }

  public handleClose = () => {
    this.setState({ show: false });
  };

  public handleShow = () => {
    this.setState({ show: true });
  };

  public render() {
    const { model, handleGoBackToExplore, handleRunAnalysis } = this.props;

    const currentModelName = this.state.modelName;
    const isMock = model && !model.slug;

    return (
      <Panel>
        <Panel.Body>
          <Button onClick={handleGoBackToExplore} bsStyle='info' type='submit'>
            <Glyphicon glyph='chevron-left' /> Explore
          </Button>
          <h3>Interactive Analysis</h3>
          <div className='item'>&nbsp;</div>
          {isMock && (
            <div className='item'>
              <FormControl
                className='item experiment-name'
                type='text'
                placeholder={'Model name'}
                value={currentModelName}
                onChange={this.handleChangeModelName}
                onKeyDown={this.handleKeyPress}
              />
            </div>
          )}
          {isMock && (
            <div className='item'>
              <Button
                onClick={this.handleSaveModel1}
                bsStyle={'info'}
                type='submit'
                disabled={currentModelName === ''}
                title={currentModelName === '' ? 'Please enter a title for your model' : ''}>
                Save model
              </Button>
            </div>
          )}
          <div className='item'>
            <Button
              onClick={handleRunAnalysis}
              bsStyle='info'
              type='submit'
              disabled={isMock}
              title={currentModelName === '' ? 'Please enter a title for your model' : ''}>
              RUN ML EXPERIMENT <Glyphicon glyph='chevron-right' />{' '}
            </Button>
          </div>
        </Panel.Body>
      </Panel>
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
