import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { IExperiment, IExperimentList } from '../API/Experiment';
import Dropdown from '../UI/DropdownExperiments';
dayjs.extend(relativeTime);
dayjs().format();

interface Props {
  experiment?: IExperiment;
  experimentList?: IExperimentList;
  handleSelectExperiment: any;
  handleShareExperiment: any;
  handleCreateNewExperiment: any;
}

export default ({
  experiment,
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
            Created {experiment && dayjs().to(dayjs(experiment.created))}
            by {experiment && experiment.createdBy}
          </p>
        </div>
        <Button
          variant={experiment?.shared ? 'secondary' : 'info'}
          onClick={handleShareExperiment}
        >
          {experiment?.shared ? 'Unshare Experiment' : 'Share Experiment'}
        </Button>

        <Button
          onClick={handleCreateNewExperiment}
          variant="info"
          type="submit"
        >
          Create new Experiment
        </Button>
      </Card.Body>
    </Card>
  );
};
