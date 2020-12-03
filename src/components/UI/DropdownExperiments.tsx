import moment from 'moment';
import * as React from 'react';
import { DropdownButton, Dropdown as BsDropdown } from 'react-bootstrap';
import styled from 'styled-components';

import { IExperimentList, IExperiment } from '../API/Experiment';

const Link = styled(BsDropdown.Item)`
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
  items: IExperiment[] | undefined;
  title: string;
  type?: string;
  handleSelect: (experiment: IExperiment) => void;
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
  <Dropdown variant={style} id={'experiment-dropdown'} title={title}>
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
        .sort((a1: IExperiment, b1: IExperiment) => {
          const a = a1.created;
          const b = b1.created;

          return a > b ? -1 : a < b ? 1 : 0;
        })
        .map((experiment, i: number) => {
          let experimentState;
          experimentState =
            experiment.status === 0
              ? 'exclamation-sign'
              : !experiment.results
              ? 'transfer'
              : experiment.viewed
              ? 'eye-open'
              : 'eye-close';

          experimentState += experiment.viewed ? ' viewed' : ' ready';

          return (
            <Link
              eventKey={`${i}`}
              key={experiment.uuid}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleSelect(experiment)}
            >
              {/*<Glyphicon glyph={experimentState} />*/} {experiment.name}{' '}
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
