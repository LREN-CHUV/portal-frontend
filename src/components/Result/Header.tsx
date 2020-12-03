import moment from 'moment'; // FIXME: change lib, too heavy
import * as React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { IExperiment, IExperimentList } from '../API/Experiment';
import Dropdown from '../UI/DropdownExperiments';

interface Props {
  experiment?: IExperiment;
  experimentList?: IExperimentList;
  handleSelectExperiment: any;
  handleShareExperiment: any;
  handleCreateNewExperiment: any;
}

export default ({
  experiment,
  experimentList,
  handleSelectExperiment,
  handleShareExperiment,
  handleCreateNewExperiment
}: Props): JSX.Element => {
  const name = experiment && experiment.name;

  return (
    <Card>
      <Card.Body>
        <div className="item text">
          <h3>
            Results of experiment <strong>{name}</strong> on{' '}
            <Link to={`/review`}>{name}</Link>
          </h3>
          <p className="item">
            Created{' '}
            {experiment &&
              moment(new Date(experiment.created), 'YYYYMMDD').fromNow()}{' '}
            by {experiment && experiment.createdBy}
          </p>
        </div>
        <div className="item">
          <Dropdown
            items={
              experiment &&
              experimentList?.experiments?.filter(
                (e: any) => e.uuid === experiment.uuid
              )
            }
            /* eslint-disable-next-line */
            style={'info'}
            title="Related experiments"
            handleSelect={handleSelectExperiment}
            handleCreateNewExperiment={handleCreateNewExperiment}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
