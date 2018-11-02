import { IExperimentResult, IModelResult } from "@app/types";
import { ExperimentContainer } from "../../../containers";

import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Dropdown } from "../../../components";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experiments: IExperimentResult[] | undefined;
  model: IModelResult | undefined;
}

export default withRouter(
  ({ experimentContainer, model, experiments, history }: IProps) => {
    const title = model && model.title;
    const modelId = model && model.slug;

    const handleSelectExperiment = async (
      selectedExperiment: IExperimentResult
    ) => {
      const { modelDefinitionId, uuid } = selectedExperiment;
      history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
      const load = experimentContainer && experimentContainer.load;
      return await load(uuid);
    };

    return (
      <Panel className="experiment-header">
        <Panel.Body>
          <h3>
            Run Experiment <strong>{title}</strong> on{" "}
            <a href={`/models/${modelId}`}>{modelId}</a>
          </h3>
          <div className="experiment-container">
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
