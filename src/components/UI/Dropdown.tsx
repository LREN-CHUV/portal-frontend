import './Dropdown.css';

import moment from 'moment';
import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { ExperimentResponse } from '../API/Experiment';

interface IDropdown {
  items: ExperimentResponse[] | undefined;
  title: string;
  type?: string;
  handleSelect: any;
  handleCreateNewExperiment: any;
  noCaret?: boolean;
}
export default ({
  items,
  title = 'No Model',
  type = 'model',
  handleSelect,
  handleCreateNewExperiment,
  noCaret = false
}: IDropdown) => (
  <DropdownButton
    noCaret={noCaret}
    bsStyle="default"
    id={'experiment-dropdown'}
    title={title}
  >
    {handleCreateNewExperiment && (
      <React.Fragment>
        <MenuItem
          eventKey={'newexperiment'}
          key={'newexperiment'}
          // tslint:disable-next-line jsx-no-lambda
          onSelect={() => handleCreateNewExperiment()}
        >
          <strong>Create New Experiment</strong>
        </MenuItem>
        <MenuItem>---------------------------</MenuItem>
      </React.Fragment>
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
            ? 'glyphicon-exclamation-sign glyph'
            : !experiment.results
            ? 'glyphicon-transfer glyph loading'
            : 'glyphicon-eye-open glyph';
          experimentState += experiment.resultsViewed ? ' viewed' : ' ready';

          return (
            <MenuItem
              eventKey={i}
              key={experiment.uuid}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleSelect(experiment)}
            >
              <span className={experimentState} /> {experiment.name}{' '}
              <span className={'time'}>
                ({moment(experiment.created, 'YYYYMMDD').fromNow()})
              </span>
            </MenuItem>
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
  </DropdownButton>
);
