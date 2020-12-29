import * as React from 'react';
import { Button, Card, FormControl } from 'react-bootstrap';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';

import { Algorithm } from '../API/Core';
import { ModelResponse } from '../API/Model';

interface Props {
  model?: ModelResponse;
  method?: Algorithm;
  handleGoBackToReview: () => void;
  handleSaveAndRunExperiment: (experimentName: string) => Promise<any>;
}
interface State {
  experimentName: string;
}

export default class Header extends React.Component<Props, State> {
  state = {
    experimentName: ''
  };

  render(): JSX.Element {
    const { model, method, handleGoBackToReview } = this.props;
    const { experimentName } = this.state;

    return (
      <Card>
        <Card.Body>
          <Button onClick={handleGoBackToReview} variant="info" type="submit">
            <BsFillCaretLeftFill /> Descriptive Analysis
          </Button>
          <h3>Create Experiment</h3>
          <div className="item" style={{ marginRight: '8px' }}>
            <FormControl
              
              className="item experiment-name"
              type="text"
              placeholder={'Experiment name'}
              value={experimentName}
              onChange={this.handleChangeExperimentName}
              onKeyDown={this.handleKeyPress}
            />
          </div>
          <div className="item">
            <Button
              onClick={this.handleSaveAndRunExperiment}
              title={
                method === undefined || method === null
                  ? 'Please choose a method on the right'
                  : experimentName === ''
                    ? 'Please enter a title for your experiment'
                    : model === undefined ||
                      model.query.trainingDatasets === undefined ||
                      model.query.trainingDatasets.length <= 0
                      ? 'Please select a dataset'
                      : ''
              }
              variant="info"
              type="submit"
              disabled={
                method === undefined ||
                method === null ||
                experimentName === '' ||
                model === undefined ||
                model.query.trainingDatasets === undefined ||
                model.query.trainingDatasets.length <= 0
              }
            >
              Run Experiment <BsFillCaretRightFill />
            </Button>
          </div>
        </Card.Body>
      </Card>
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
