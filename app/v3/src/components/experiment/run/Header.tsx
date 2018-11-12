// tslint:disable:no-console
import { IExperimentResult, IModelResult } from "@app/types";
import { ExperimentContainer, ModelContainer } from "../../../containers";

import * as React from "react";
import { Button, FormControl, Overlay, Panel, Popover } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Dropdown from "../Dropdown";
import DropdownModel from "./Dropdown";

interface IProps extends RouteComponentProps<any> {
  handleSaveAndRunExperiment: any;
  handleChangeExperimentName: any;
  selectedMethod: any;
  experimentName: string;
  showPopover: boolean;
  experimentContainer: ExperimentContainer;
  modelContainer: ModelContainer;
}

// private experimentNameRef: any;

export default withRouter(
  ({
    handleSaveAndRunExperiment,
    handleChangeExperimentName,
    selectedMethod,
    experimentName,
    showPopover,
    experimentContainer,
    modelContainer,
    history
  }: IProps) => {
    const state = modelContainer.state;
    const title = (state && state.model && state.model.title) || "";
    const experiments = experimentContainer.state.experiments;

    const handleSelectExperiment = async (
      selectedExperiment: IExperimentResult
    ) => {
      const { modelDefinitionId, uuid } = selectedExperiment;
      history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
      const load = experimentContainer && experimentContainer.one;
      return await load(uuid);
    };

    const handleSelectModel = async (selectedModel: IModelResult) => {
      console.log(selectedModel);
      const { slug } = selectedModel;
      history.push(`/v3/experiment/${slug}`);
      const load = modelContainer && modelContainer.one;
      return await load(slug);
    };

    return (
      <Panel className="experiment-header">
        <Panel.Body>
          <h3>
            Create Experiment on{" "}
            <DropdownModel
              items={modelContainer.state.models}
              title={title}
              handleSelect={handleSelectModel}
            />
          </h3>
          <div className="item flexbox">
            {/* <div ref={r => (this.experimentNameRef = r)}> */}
            <FormControl
              className="item experiment-name"
              type="text"
              placeholder={"Experiment name"}
              value={experimentName}
              onChange={handleChangeExperimentName}
            />
            {/* </div> */}

            <Button
              className="item"
              onClick={handleSaveAndRunExperiment}
              bsStyle="info"
              disabled={selectedMethod === undefined}
            >
              Run Experiment
            </Button>
            <Overlay
              show={showPopover}
              placement="bottom"
              // container={this.experimentNameRef}
            >
              <Popover
                id="popover-positioned-bottom"
                title="Almost there"
                style={{ position: "relative" }}
              >
                Enter a name for your experiment.
              </Popover>
            </Overlay>
          </div>
          <div className="experiment-container">
            <h5 className="item">Hex</h5>
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
);
