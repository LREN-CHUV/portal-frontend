import * as React from 'react';
import { Button, FormControl, Glyphicon, Panel } from 'react-bootstrap';

import { Method } from '../../API/Core';
import { ExperimentResponse } from '../../API/Experiment';
import { ModelResponse } from '../../API/Model';
import Dropdown from '../../UI/Dropdown';

interface Props {
  model?: ModelResponse;
  experiments?: ExperimentResponse[];
  method?: Method;
  handleGoBackToReview: () => void;
  handleSelectExperiment: (experiment: ExperimentResponse) => Promise<any>;
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
    const { experiments, model, method, handleGoBackToReview, handleSelectExperiment } = this.props;
    const { experimentName } = this.state;

    return (
      <Panel>
        <Panel.Body>
          <Button onClick={handleGoBackToReview} bsStyle='info' type='submit'>
            <Glyphicon glyph='chevron-left' /> Review
          </Button>
          <h3>Create Experiment</h3>
          <div className='item'>
            <Dropdown
              items={model && experiments && experiments.filter((e: any) => e.modelDefinitionId === model.slug)}
              title='RELATED EXPERIMENTS'
              handleSelect={handleSelectExperiment}
              handleCreateNewExperiment={null}
            />
          </div>
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
                  ? 'Please choose a method on the right'
                  : experimentName === ''
                  ? 'Please enter a title for your experiment'
                  : ''
              }
              bsStyle='info'
              type='submit'
              disabled={method === undefined || experimentName === ''}>
              Run Experiment{' '}
              <Glyphicon glyph='chevron-right' />
            </Button>
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
