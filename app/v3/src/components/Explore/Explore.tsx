import './Explore.css';

import { HierarchyNode } from 'd3';
import React from 'react';
import { Checkbox, Panel, Button } from 'react-bootstrap';

import { MIP } from '../../types';
import CirclePack from './CirclePack';
import Statistics from './Statistics';

interface IProps {
  datasets?: MIP.API.IVariableEntity[];
  selectedDatasets: MIP.API.IVariableEntity[];
  hierarchyNode?: HierarchyNode<MIP.Internal.IVariableDatum>;
  histograms?: any;
  handleSelectDataset: (e: any) => void;
  handleSelectVariable: (node: any) => void;
}

export default ({
  datasets,
  selectedDatasets,
  hierarchyNode,
  histograms,
  handleSelectVariable,
  handleSelectDataset
}: IProps) => {
  return (
    <div className='Explore'>
      <div className='header' />
      <div className='content'>
        <div className='column'>
          <Panel className='datasets'>
            <Panel.Title>
              <h3>Datasets</h3>
              {datasets &&
                datasets.map((dataset: any) => (
                  <Checkbox
                    key={dataset.code}
                    inline={true}
                    // tslint:disable-next-line jsx-no-lambda
                    onChange={() => {
                      handleSelectDataset(dataset);
                    }}
                    checked={selectedDatasets
                      .map(s => s.code)
                      .includes(dataset.code)}>
                    {dataset.label}
                  </Checkbox>
                ))}
            </Panel.Title>
          </Panel>
          <Panel className='circle-pack'>
            <Panel.Title>
              <h3>Variables</h3>
            </Panel.Title>
            <Panel.Body>
              <CirclePack
                hierarchyNode={hierarchyNode}
                handleSelectVariable={handleSelectVariable}
              />
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
            <Panel.Body>
              <div>
                <Button>+ AS VARIABLE</Button>
                <p>Variable</p>
              </div>
              <div>
                <Button>+ AS COVARIABLE</Button>
                <p>Nominal</p>
                <p>Continuous</p>
              </div>
              <div>
                <Button>+ AS FILTER</Button>
                <p>Filters</p>
              </div>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    </div>
  );
};
