import './Explore.css';

import React from 'react';
import { Panel } from 'react-bootstrap';

import { MIP } from '../../types';
import CirclePack from './CirclePack';

interface IProps {
  hierarchy?: MIP.Internal.IVariableDatum;
  handleSelectVariable: (node: any) => void;
}

export default ({ hierarchy, handleSelectVariable }: IProps) => {
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
              {hierarchy && (
                <CirclePack
                  hierarchy={hierarchy}
                  handleSelectVariable={handleSelectVariable}
                />
              )}
            </Panel.Body>
          </Panel>
        </div>
        <div className='column'>
          <Panel className='statistics'>
            <Panel.Title>
              <h3>Statistics Summary</h3>
            </Panel.Title>
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
