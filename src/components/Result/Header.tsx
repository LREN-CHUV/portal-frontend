import moment from 'moment'; // FIXME: change lib, too heavy
import * as React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { ExperimentResponse } from '../API/Experiment';
import Dropdown from '../UI/DropdownExperiments';

interface Props {
  experiment?: ExperimentResponse;
  experiments?: ExperimentResponse[];
  handleSelectExperiment: any;
  handleShareExperiment: any;
  handleCreateNewExperiment: any;
}

export default ({
  experiment,
  experiments,
  handleSelectExperiment,
  handleShareExperiment,
  handleCreateNewExperiment
}: Props): JSX.Element => {
  const name = experiment && experiment.name;
  const modelDefinitionId = experiment && experiment.modelDefinitionId;
  const shared = experiment && experiment.shared;

  return (
    <Panel>
      <Panel.Body>
        <div className="item text">
          <h3>
            Results of Experiment <strong>{name}</strong> on{' '}
            <Link to={`/review`}>{modelDefinitionId}</Link>
          </h3>
          <h5 className="item">
            Created{' '}
            {experiment &&
              moment(new Date(experiment.created), 'YYYYMMDD').fromNow()}{' '}
            by {experiment && experiment.user && experiment.user.username}
          </h5>
        </div>
        <div className="item">
          <Button bsStyle={'info'} onClick={handleShareExperiment}>
            {shared ? 'UNSHARE EXPERIMENT' : 'SHARE EXPERIMENT'}
          </Button>
        </div>
        <div className="item">
          <Dropdown
            items={
              experiment &&
              experiments &&
              experiments.filter(
                (e: any) => e.modelDefinitionId === experiment.modelDefinitionId
              )
            }
            title="RELATED EXPERIMENTS"
            handleSelect={handleSelectExperiment}
            handleCreateNewExperiment={handleCreateNewExperiment}
          />
        </div>
      </Panel.Body>
    </Panel>
  );
};
