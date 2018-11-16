// tslint:disable:no-console
import { APIExperiment, APIModel } from "@app/components/API";
import { IExperimentResult, IModelResult } from "@app/types";

import Dropdown from "@app/components/UI/Dropdown";
import DropdownModel from "@app/components/UI/DropdownModel";
import * as React from "react";
import { Button, FormControl, Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";

interface IProps extends RouteComponentProps<any> {
  handleSaveAndRunExperiment: any;
  handleChangeExperimentName: any;
  selectedMethod: any;
  experimentName: string;
  apiExperiment: APIExperiment;
  apiModel: APIModel;
}

export default withRouter(
  ({
    handleSaveAndRunExperiment,
    handleChangeExperimentName,
    selectedMethod,
    experimentName,
    apiExperiment,
    apiModel,
    history
  }: IProps) => {
    const state = apiModel.state;
    const title = (state && state.model && state.model.title) || "";
    const experiments = apiExperiment.state.experiments;

    const handleSelectExperiment = async (
      selectedExperiment: IExperimentResult
    ) => {
      const { modelDefinitionId, uuid } = selectedExperiment;
      history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
      const load = apiExperiment && apiExperiment.one;
      return await load(uuid);
    };

    const handleSelectModel = async (selectedModel: IModelResult) => {
      console.log(selectedModel);
      const { slug } = selectedModel;
      history.push(`/v3/experiment/${slug}`);
      const load = apiModel && apiModel.one;
      return await load(slug);
    };

    return (
      <Panel className="experiment-header">
        <Panel.Body>
          <h3>
            Create Experiment on{" "}
            <DropdownModel
              items={apiModel.state.models}
              title={title}
              handleSelect={handleSelectModel}
            />
          </h3>
          <div className="create-experiment-container">
            <div className="item">
              <FormControl
                className="item experiment-name"
                type="text"
                placeholder={"Experiment name"}
                value={experimentName}
                onChange={handleChangeExperimentName}
              />
            </div>
            <div className="item">
              <Button
                onClick={handleSaveAndRunExperiment}
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
);
