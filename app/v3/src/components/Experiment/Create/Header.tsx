import Dropdown from "@app/components/UI/Dropdown";
import DropdownModel from "@app/components/UI/DropdownModel";
import { IExperimentResult, IMethodDefinition, IModelResult } from "@app/types";
import * as React from "react";
import { Button, FormControl, Panel } from "react-bootstrap";

interface IProps {
  title: string | undefined;
  models: IModelResult[] | undefined;
  experiments: IExperimentResult[] | undefined;
  selectedMethod: IMethodDefinition | undefined;
  handleSelectModel: any;
  handleSelectExperiment: any;
  handleSaveAndRunExperiment: any;
}
interface IState {
  experimentName: string;
}

export default class Header extends React.Component<IProps, IState> {
  public state = {
    experimentName: ""
  };

  public render() {
    const {
      experiments,
      models,
      title,
      selectedMethod,
      handleSelectModel,
      handleSelectExperiment,
      handleSaveAndRunExperiment
    } = this.props;
    const { experimentName } = this.state;

    return (
      <Panel className="experiment-header">
        <Panel.Body>
          <h3>
            Create Experiment on{" "}
            {models && (
              <DropdownModel
                items={models}
                title={title}
                handleSelect={handleSelectModel}
              />
            )}
          </h3>
          <div className="create-experiment-container">
            <div className="item">
              <FormControl
                className="item experiment-name"
                type="text"
                placeholder={"Experiment name"}
                value={experimentName}
                onChange={this.handleChangeExperimentName}
              />
            </div>
            <div className="item">
              <Button
                //tslint:disable
                onClick={() => handleSaveAndRunExperiment(experimentName)}
                bsStyle="info"
                disabled={selectedMethod === undefined}
              >
                Run Experiment
              </Button>
            </div>
            <div className="item">
              <Dropdown
                items={experiments}
                title="RELATED EXPERIMENTS"
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
}
