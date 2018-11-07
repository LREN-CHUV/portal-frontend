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
  experiments: IExperimentResult[] | undefined;
  modelContainer: ModelContainer;
}

export default withRouter(
  ({ experimentContainer, modelContainer, experiments, history }: IProps) => {
    const state = modelContainer.state;
    const title = (state && state.model && state.model.title) || "";
    // const modelId = model && model.slug;

    const handleSelectExperiment = async (
      selectedExperiment: IExperimentResult
    ) => {
      const { modelDefinitionId, uuid } = selectedExperiment;
      history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
      const load = experimentContainer && experimentContainer.load;
      return await load(uuid);
    };

    const handleSelectModel = async (selectedModel: IModelResult) => {
      console.log(selectedModel);
      const { slug } = selectedModel;
      history.push(`/v3/experiment/${slug}`);
      const load = modelContainer && modelContainer.load;
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
              />
            </div>
          </div>
        </Panel.Body>
      </Panel>
    );
  }
);
