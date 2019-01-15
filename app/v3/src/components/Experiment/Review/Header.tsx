import * as React from "react";
import { Button, FormControl, Panel } from "react-bootstrap";

interface IProps {
  handleRunAnalysis: (name: string) => void;
}

export default class Header extends React.Component<IProps> {
    public state = {
        modelName: ""
      };
      
      public render() {
    const { handleRunAnalysis } = this.props;
    const { modelName } = this.state;

    return (
      <Panel>
        <Panel.Body>
          <h3>Interactive Analysis</h3>
          <div className="actions">
            <div className="item">
              <FormControl
                className="item experiment-name"
                type="text"
                placeholder={"Experiment name"}
                value={modelName}
                onChange={this.handleChangeModelName}
              />
            </div>
            <div className="item">
              <Button
                //tslint:disable
                onClick={() => handleRunAnalysis(modelName)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    handleRunAnalysis(modelName);
                  }
                }}
                bsStyle="info"
                type="submit"
                disabled={modelName === undefined}
              >
                RUN MACHINE LEARNING EXPERIMENT
              </Button>
            </div>
          </div>
        </Panel.Body>
      </Panel>
    );
  }

  private handleChangeModelName = (event: any) => {
    this.setState({
      modelName: event.target.value
    });
  };
}
