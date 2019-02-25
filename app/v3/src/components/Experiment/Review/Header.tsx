import * as React from 'react';
import { Button, FormControl, Glyphicon, Panel } from 'react-bootstrap';
import { MIP } from '../../../types';
import DropdownModel from '../../UI/DropdownModel';

interface IProps {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
  handleSaveModel: ({ title }: { title: string }) => void;
  handleSelectModel: (model: MIP.API.IModelResponse) => void;
  modelName?: string;
  models?: MIP.API.IModelResponse[];
  isMock?: boolean;
}
export default class Header extends React.Component<IProps> {
  public state: any;
  private input: any;

  constructor(props: IProps) {
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
    const {
      models,
      modelName,
      isMock,
      handleGoBackToExplore,
      handleRunAnalysis,
      handleSelectModel
    } = this.props;

    const currentModelName = this.state.modelName;

    return (
      <Panel>
        <Panel.Body>
          <h3>
            Interactive Analysis{' '}
            <span>
              {`on `}
              {models && (
                <DropdownModel
                  items={models}
                  title={modelName !== '' ? modelName : undefined}
                  handleSelect={handleSelectModel}
                />
              )}
            </span>
          </h3>
          <div className='actions status'>
            <div className='item'>
              <Button
                onClick={handleGoBackToExplore}
                bsStyle='info'
                type='submit'>
                <Glyphicon glyph='chevron-left' /> Explore
              </Button>
            </div>
            <div className='item text'>&nbsp;</div>
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
                  title={
                    currentModelName === ''
                      ? 'Please enter a title for your model'
                      : ''
                  }>
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
                title={
                  currentModelName === ''
                    ? 'Please enter a title for your model'
                    : ''
                }>
                RUN MACHINE LEARNING EXPERIMENT{' '}
                <Glyphicon glyph='chevron-right' />{' '}
              </Button>
            </div>
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
