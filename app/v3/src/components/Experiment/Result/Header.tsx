import Dropdown from "@app/components/UI/Dropdown";
import { IExperimentResult } from "@app/types";
import moment from "moment"; // FIXME: change lib, too heavy
import * as React from "react";
import { Button, Panel } from "react-bootstrap";

interface IProps {
  experiment: IExperimentResult | undefined;
  experiments: IExperimentResult[] | undefined;
  handleSelectExperiment: any;
  handleCreateNewExperiment: any;
}

export default ({
  experiment,
  experiments,
  handleSelectExperiment,
  handleCreateNewExperiment
}: IProps) => {
  const name = experiment && experiment.name;
  const modelDefinitionId = experiment && experiment.modelDefinitionId;

  return (
    <Panel>
      <Panel.Body>
        <h3>
          Results of Experiment <strong>{name}</strong> on{" "}
          <a href={`/models/${modelDefinitionId}`}>{modelDefinitionId}</a>
        </h3>
        <div className="info-actions">
          <h5 className="item">
            Created{" "}
            {experiment &&
              moment(new Date(experiment.created), "YYYYMMDD").fromNow()}{" "}
            by {experiment && experiment.user.username}
          </h5>
          <div className="item">
            <Button bsStyle="info">SHARE EXPERIMENT</Button>
          </div>
          <div className="item">
            <Dropdown
              items={
                experiment &&
                experiments &&
                experiments.filter(
                  (e: any) =>
                    e.modelDefinitionId === experiment.modelDefinitionId
                )
              }
              title="RELATED EXPERIMENTS"
              handleSelect={handleSelectExperiment}
              handleCreateNewExperiment={handleCreateNewExperiment}
            />
          </div>
        </div>
      </Panel.Body>
    </Panel>
  );
};
