import React from 'react';
import { Button, Checkbox, Panel } from 'react-bootstrap';
import { APIModel } from '../../API';
import { VariableEntity } from '../../API/Core';
import DropdownModel from '../../UI/DropdownModel';
import { D3Model, HierarchyCircularNode, ModelType } from './Container';
import Histograms from './D3Histograms';
import ModelView from './D3Model';
import Search from './D3Search';
import './Explore.css';
import Header from './Header';

export interface ExploreProps {
  apiModel: APIModel;
  children?: any;
  datasets?: VariableEntity[];
  selectedDatasets: VariableEntity[];
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleD3ChangeModel: Function;
  handleSelectModel: Function;
  handleGoToAnalysis: Function;
  zoom: Function;
}

export default (props: ExploreProps) => {
  const {
    apiModel,
    children,
    layout,
    datasets,
    selectedDatasets,
    selectedNode,
    histograms,
    d3Model,
    handleSelectNode,
    handleSelectDataset,
    handleD3ChangeModel,
    handleSelectModel,
    handleGoToAnalysis,
    zoom
  } = props;

  return (
    <div className='Explore'>
      <div className='content'>
        <div className='sidebar'>
          <Panel className='datasets'>
            <Panel.Title>
              <h3>Datasets</h3>
            </Panel.Title>
            <Panel.Body>
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
            </Panel.Body>
          </Panel>
          <Panel className='model'>
            <Panel.Title>
              <h3>Model</h3>
              <div>
                {apiModel.state.models && (
                  <DropdownModel
                    items={apiModel.state.models}
                    handleSelect={handleSelectModel}
                  />
                )}
              </div>
            </Panel.Title>
            <Panel.Body className='model-body'>
              <ModelView
                model={d3Model}
                handleD3ChangeModel={handleD3ChangeModel}
                handleSelectNode={handleSelectNode}
                zoom={zoom}
              />
            </Panel.Body>
          </Panel>
        </div>
        <div className='column'>
          <Panel className='circle-pack'>
            <Panel.Title>
              <div className='variable-box'>
                <h3 className='child'>Variables</h3>
                <Search
                  hierarchy={layout}
                  zoom={zoom}
                  handleSelectNode={handleSelectNode}
                />
              </div>
            </Panel.Title>
            <Panel.Body>
              <div className='buttons'>
                <div className='child-title'>
                  <h5>Add to model</h5>
                </div>
                <Button
                  className='child'
                  bsStyle={'success'}
                  bsSize={'small'}
                  disabled={
                    !selectedNode ||
                    (selectedNode && !selectedNode.data.isVariable)
                  }
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() =>
                    handleD3ChangeModel(ModelType.VARIABLE, selectedNode)
                  }>
                  {d3Model.variable === selectedNode ? '-' : '+'} AS VARIABLE
                </Button>
                <Button
                  className='child'
                  bsStyle={'warning'}
                  bsSize={'small'}
                  disabled={!selectedNode}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() =>
                    handleD3ChangeModel(ModelType.COVARIABLE, selectedNode)
                  }>
                  {d3Model.covariables &&
                  selectedNode &&
                  d3Model.covariables.filter(c =>
                    selectedNode.leaves().includes(c)
                  ).length === selectedNode.leaves().length
                    ? '-'
                    : '+'}{' '}
                  AS COVARIABLE
                </Button>
                <Button
                  className='child'
                  bsStyle={'primary'}
                  bsSize={'small'}
                  disabled={!selectedNode}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() =>
                    handleD3ChangeModel(ModelType.FILTER, selectedNode)
                  }>
                  {d3Model.filters &&
                  selectedNode &&
                  d3Model.filters.filter(c => selectedNode.leaves().includes(c))
                    .length === selectedNode.leaves().length
                    ? '-'
                    : '+'}{' '}
                  AS FILTER
                </Button>
              </div>
              {children}
            </Panel.Body>
          </Panel>
        </div>
        <div className='column'>
          <div className='header'>
            <Header handleGoToAnalysis={handleGoToAnalysis}/>
          </div>

          <Panel className='statistics'>
            <Panel.Title>
              <h3>Statistics Summary</h3>
            </Panel.Title>
            <Panel.Body>
              <Histograms
                histograms={histograms}
                selectedNode={selectedNode}
                handleSelectedNode={handleSelectNode}
                zoom={zoom}
              />
            </Panel.Body>
          </Panel>
        </div>
      </div>
    </div>
  );
};
