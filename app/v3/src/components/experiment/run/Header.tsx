// tslint:disable:no-console
import { IExperimentResult, IModelResult } from "@app/types";
import { ExperimentContainer, ModelContainer } from "../../../containers";

import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Dropdown from "../Dropdown";
import DropdownModel from "./Dropdown";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  modelContainer: ModelContainer;
}

export default withRouter(
  ({ experimentContainer, modelContainer, history }: IProps) => {
    const state = modelContainer.state;
    const title = (state && state.model && state.model.title) || "";
const experiments = experimentContainer.state.experiments
    
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
      <Panel>
        <Panel.Body>
          <div className="flexbox">
            <div className="item">
              <h3>
                Run Experiment on{" "}
                <DropdownModel
                  items={modelContainer.state.models}
                  title={title}
                  handleSelect={handleSelectModel}
                />
              </h3>
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
