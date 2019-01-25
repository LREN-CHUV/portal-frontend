import Dropdown from "@app/components/UI/Dropdown";
import DropdownModel from "@app/components/UI/DropdownModel";
import { MIP } from "@app/types";
import * as React from "react";
import { Button, FormControl, Glyphicon, Panel } from "react-bootstrap";
interface IProps {
  title?: string;
  models?: MIP.API.IModelResponse[];
  experiments?: MIP.API.IExperimentResponse[];
  method?: MIP.API.IMethod;
  handleGoBackToReview: () => void;
  handleSelectModel: (model: MIP.API.IModelResponse) => Promise<any>;
  handleSelectExperiment: (
    experiment: MIP.API.IExperimentResponse
  ) => Promise<any>;
  handleSaveAndRunExperiment: (experimentName: string) => Promise<any>;
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
      method,
      handleGoBackToReview,
      handleSelectModel,
      handleSelectExperiment,
      handleSaveAndRunExperiment
    } = this.props;
    const { experimentName } = this.state;

    return (
      <Panel>
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
          <div className="actions">
            <div className="item">
              <Button
                //tslint:disable
                onClick={handleGoBackToReview}
                bsStyle="info"
                type="submit"
              >
                <Glyphicon glyph="chevron-left" /> Review
              </Button>
            </div>
            <div className="item text">&nbsp;</div>
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
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    handleSaveAndRunExperiment(experimentName);
                  }
                }}
                title={
                  method === undefined
                    ? "Please choose an experiment on the right"
                    : experimentName === ""
                    ? "Please enter a title for your experiment"
                    : ""
                }
                bsStyle="info"
                type="submit"
                disabled={method === undefined || experimentName === ""}
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
