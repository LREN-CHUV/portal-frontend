import moment from 'moment';
import * as React from 'react';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';

import { ExperimentResponse } from '../API/Experiment';

const Link = styled(MenuItem)`
  a {
    color: black !important;
  }

  .ready {
    color: #5bc0de;
  }

  .viewed {
    color: #5cb85c;
  }
`;

const Dropdown = styled(DropdownButton)`
  color: white !important;
`;

interface IDropdown {
  items: ExperimentResponse[] | undefined;
  title: string;
  type?: string;
  handleSelect: (experiment: ExperimentResponse) => void;
  handleCreateNewExperiment: (() => void) | null;
  noCaret?: boolean;
  style?: string;
}

export default ({
  items,
  title = 'No Model',
  type = 'model',
  handleSelect,
  handleCreateNewExperiment,
  noCaret = false,
  style = 'default'
}: IDropdown): JSX.Element => (
  <Dropdown
    noCaret={noCaret}
    bsStyle={style}
    id={'experiment-dropdown'}
    title={title}
  >
    {handleCreateNewExperiment && (
      <>
        <Link
          eventKey={'newexperiment'}
          key={'newexperiment'}
          onSelect={handleCreateNewExperiment}
        >
          <strong>Create New Experiment</strong>
        </Link>
        <Link>---------------------------</Link>
      </>
    )}
    {(items &&
      handleSelect &&
      items.length > 0 &&
      items
        .sort((a1: ExperimentResponse, b1: ExperimentResponse) => {
          const a = a1.created;
          const b = b1.created;

          return a > b ? -1 : a < b ? 1 : 0;
        })
        .map((experiment, i: number) => {
          let experimentState;
          experimentState = experiment.error
            ? 'exclamation-sign'
            : !experiment.results
            ? 'transfer'
            : experiment.resultsViewed
            ? 'eye-open'
            : 'eye-close';

          experimentState += experiment.resultsViewed ? ' viewed' : ' ready';

          return (
            <Link
              eventKey={i}
              key={experiment.uuid}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleSelect(experiment)}
            >
              <Glyphicon glyph={experimentState} /> {experiment.name}{' '}
              <span>({moment(experiment.created, 'YYYYMMDD').fromNow()})</span>
            </Link>
          );
        })) || (
      <div style={{ margin: '8px' }}>
        {type === 'models' && (
          <span>
            <p>You have no running experiments.</p>
            <p>
              You can start one by selecting a model and configuring an
              experiment on it.
            </p>
          </span>
        )}
        {type === 'model' && (
          <p>You have no running experiments on this model.</p>
        )}
      </div>
    )}
  </Dropdown>
);
