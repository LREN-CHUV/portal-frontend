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

export interface ExploreProps {
  apiModel: APIModel;
  children?: any;
  datasets?: VariableEntity[];
  selectedDatasets: VariableEntity[];
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleChangeModel: Function;
  handleSelectModel: Function;
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
    model,
    handleSelectNode,
    handleSelectDataset,
    handleChangeModel,
    handleSelectModel,
    zoom
  } = props;

  return (
    <div className='Explore'>
      <div className='header'>{/* <Header /> */}</div>
      <div className='content'>
        <div className='sidebar'>
          <Panel className='model'>
            <Panel.Title>
              <h3>Model</h3>
              <span>
                {`on `}
                {apiModel.state.models && (
                  <DropdownModel
                    items={apiModel.state.models}
                    handleSelect={handleSelectModel}
                  />
                )}
              </span>
            </Panel.Title>
            <Panel.Body className='model-body'>
              <ModelView
                model={model}
                handleChangeModel={handleChangeModel}
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
                  <h5>ADD TO MODEL</h5>
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
                    handleChangeModel(ModelType.VARIABLE, selectedNode)
                  }>
                  {model.variable === selectedNode ? '-' : '+'} AS VARIABLE
                </Button>
                <Button
                  className='child'
                  bsStyle={'warning'}
                  bsSize={'small'}
                  disabled={!selectedNode}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() =>
                    handleChangeModel(ModelType.COVARIABLE, selectedNode)
                  }>
                  {model.covariables &&
                  selectedNode &&
                  model.covariables.filter(c =>
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
                    handleChangeModel(ModelType.FILTER, selectedNode)
                  }>
                  {model.filters &&
                  selectedNode &&
                  model.filters.filter(c => selectedNode.leaves().includes(c))
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
