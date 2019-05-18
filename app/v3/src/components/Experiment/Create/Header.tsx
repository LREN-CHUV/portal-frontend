import * as React from 'react';
import { Button, FormControl, Glyphicon, Panel } from 'react-bootstrap';
import { MIP } from '../../../types';
import { ModelResponse } from '../../API/Model';
import Dropdown from '../../UI/Dropdown';
import DropdownModel from '../../UI/DropdownModel';

interface Props {
  model?: ModelResponse;
  models?: ModelResponse[];
  experiments?: MIP.API.IExperimentResponse[];
  method?: MIP.API.IMethod;
  handleGoBackToReview: () => void;
  handleSelectModel: (model: ModelResponse) => Promise<any>;
  handleSelectExperiment: (
    experiment: MIP.API.IExperimentResponse
  ) => Promise<any>;
  handleSaveAndRunExperiment: (experimentName: string) => Promise<any>;
}
interface State {
  experimentName: string;
}

export default class Header extends React.Component<Props, State> {
  public state = {
    experimentName: ''
  };

  public render() {
    const {
      experiments,
      models,
      model,
      method,
      handleGoBackToReview,
      handleSelectModel,
      handleSelectExperiment
    } = this.props;
    const { experimentName } = this.state;

    return (
      <Panel>
        <Panel.Body>
          <h3>
            Create Experiment on{' '}
            {models && (
              <DropdownModel
                items={models}
                selectedSlug={model && model.slug}
                handleSelect={handleSelectModel}
              />
            )}
          </h3>
          <div className='actions'>
            <div className='item'>
              <Button
                onClick={handleGoBackToReview}
                bsStyle='info'
                type='submit'>
                <Glyphicon glyph='chevron-left' /> Review
              </Button>
            </div>
            <div className='item text'>&nbsp;</div>
            <div className='item'>
              <FormControl
                className='item experiment-name'
                type='text'
                placeholder={'Experiment name'}
                value={experimentName}
                onChange={this.handleChangeExperimentName}
                onKeyDown={this.handleKeyPress}
              />
            </div>
            <div className='item'>
              <Button
                onClick={this.handleSaveAndRunExperiment}
                title={
                  method === undefined
                    ? 'Please choose an experiment on the right'
                    : experimentName === ''
                    ? 'Please enter a title for your experiment'
                    : ''
                }
                bsStyle='info'
                type='submit'
                disabled={method === undefined || experimentName === ''}>
                Run Experiment
              </Button>
            </div>
            <div className='item'>
              <Dropdown
                items={
                  model &&
                  experiments &&
                  experiments.filter(
                    (e: any) => e.modelDefinitionId === model.slug
                  )
                }
                title='RELATED EXPERIMENTS'
                handleSelect={handleSelectExperiment}
                handleCreateNewExperiment={null}
              />
            </div>
          </div>
        </Panel.Body>
      </Panel>
    );
  }

  private handleChangeExperimentName = (event: any) => {
    this.setState({
      experimentName: event.target.value
    });
  };

  private handleKeyPress = (event: any) => {
    const code = event.keyCode || event.charCode;
    if (code === 13) {
      event.preventDefault();
      event.stopPropagation();
      const { handleSaveAndRunExperiment } = this.props;
      handleSaveAndRunExperiment(this.state.experimentName);
    }
  };

  private handleSaveAndRunExperiment = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const { handleSaveAndRunExperiment } = this.props;
    handleSaveAndRunExperiment(this.state.experimentName);
  };
}
