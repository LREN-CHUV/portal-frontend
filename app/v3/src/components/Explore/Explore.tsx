import './Explore.css';

import React from 'react';
import { Panel } from 'react-bootstrap';

import { MIP } from '../../types';
import CirclePack from './CirclePack';
import Statistics from './Statistics';

interface IProps {
  hierarchy?: MIP.Internal.IVariableDatum;
  histograms?: any;
  handleSelectVariable: (node: any) => void;
}

export default ({ hierarchy, histograms, handleSelectVariable }: IProps) => {
  return (
    <div className='Explore'>
      <div className='header' />
      <div className='content'>
        <div className='column'>
          <Panel className='datasets'>
            <Panel.Title>
              <h3>Datasets</h3>
            </Panel.Title>
          </Panel>
          <Panel className='circle-pack'>
            <Panel.Title>
              <h3>Variables</h3>
            </Panel.Title>
            <Panel.Body>
              <CirclePack
                hierarchy={hierarchy}
                handleSelectVariable={handleSelectVariable}
              />
              )
            </Panel.Body>
          </Panel>
        </div>
        <div className='column'>
          <Panel className='statistics'>
            <Panel.Title>
              <h3>Statistics Summary</h3>
            </Panel.Title>
            <Panel.Body>
              <Statistics histograms={histograms} />
            </Panel.Body>
          </Panel>
          <Panel className='model'>
            <Panel.Title>
              <h3>Model</h3>
            </Panel.Title>
          </Panel>
        </div>
      </div>
    </div>
  );
};
