import * as React from 'react';
import { Button, Checkbox, Glyphicon, Panel } from 'react-bootstrap';

import { APICore, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import DropdownModel from '../UI/DropdownModel';
import { D3Model, HierarchyCircularNode, ModelType } from './Container';
import Histograms from './D3Histograms';
import ModelView from './D3Model';
import Search from './D3Search';
import styled from 'styled-components';
export interface ExploreProps {
  apiCore: APICore;
  apiModel: APIModel;
  children?: any;
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectPathology: (code: string) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleUpdateD3Model: Function;
  handleSelectModel: (model?: ModelResponse) => void;
  handleGoToAnalysis: any; // FIXME Promise<void>
  zoom: (circleNode: HierarchyCircularNode) => void;
}

export default (props: ExploreProps): JSX.Element => {
  const {
    apiCore,
    apiModel,
    children,
    layout,
    selectedNode,
    histograms,
    d3Model,
    handleSelectNode,
    handleSelectDataset,
    handleSelectPathology,
    handleUpdateD3Model,
    handleSelectModel,
    handleGoToAnalysis,
    zoom
  } = props;

  const model = apiModel.state.model;
  const selectedDatasets =
    (model && model.query && model.query.trainingDatasets) || [];
  const selectedPathology = model && model.query && model.query.pathology;
  const datasets = apiCore.datasetsForPathology(selectedPathology);

  const PanelTitle = styled(Panel.Title)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 0 16px 0 0;
  `;

  const Buttons = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 0 0 8px 0;
    padding: 2px;
    border-bottom: 1px solid lightgray;

    div:first-child {
      flex: 1;
    }

    h5 {
      margin-right: 4px;
    }

    button {
      flex: 1;
      margin-right: 4px;
    }
  `;

  const style = {
    display: 'flex',
    justifyContent: 'space-between'
  };

  return (
    <div style={style}>
      <div style={{ flex: 1, marginRight: '8px' }}>
        <Panel>
          <Panel.Title>
            <div style={{ padding: '1em', border: '1px solid #999' }}>
              <b>Pathologies</b>
              {apiCore.state.pathologies &&
                apiCore.state.pathologies.length > 1 &&
                apiCore.state.pathologies.map(g => (
                  <label key={g.code}>
                    <input
                      type="radio"
                      id={g.code}
                      name={g.label}
                      value={g.code}
                      checked={selectedPathology === g.code}
                      // tslint:disable jsx-no-lambda
                      onChange={(e): void => {
                        handleSelectPathology(e.target.value);
                      }}
                    />{' '}
                    {g.label}
                  </label>
                ))}
              <div>
                <b>Datasets</b>{' '}
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
                        .includes(dataset.code)}
                    >
                      {dataset.label}
                    </Checkbox>
                  ))}
              </div>
              <Search
                hierarchy={layout}
                zoom={zoom}
                handleSelectNode={handleSelectNode}
              />
            </div>
          </Panel.Title>
          <Panel.Body>{children}</Panel.Body>
        </Panel>
      </div>
      <div style={{ flex: 1 }}>
        <Panel className="statistics">
          <PanelTitle>
            <h3>{selectedNode && selectedNode.data.label}</h3>
            <Button bsStyle="info" type="submit" onClick={handleGoToAnalysis}>
              Interactive Analysis <Glyphicon glyph="chevron-right" />
            </Button>
          </PanelTitle>
          <Panel.Body>
            <Histograms
              histograms={histograms}
              selectedNode={selectedNode}
              handleSelectedNode={handleSelectNode}
              zoom={zoom}
            />
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Body>
            <Buttons>
              <DropdownModel
                items={apiModel.state.models}
                selectedSlug={apiModel.state.model && apiModel.state.model.slug}
                showClear={true}
                handleSelect={handleSelectModel}
              />

              <h5>Add to model</h5>

              <Button
                className="child"
                bsStyle={'success'}
                bsSize={'small'}
                disabled={!selectedNode}
                // tslint:disable-next-line jsx-no-lambda
                onClick={() =>
                  handleUpdateD3Model(ModelType.VARIABLE, selectedNode)
                }
              >
                {d3Model.variables &&
                selectedNode &&
                d3Model.variables.filter(c => selectedNode.leaves().includes(c))
                  .length === selectedNode.leaves().length
                  ? '-'
                  : '+'}{' '}
                AS VARIABLE
              </Button>
              <Button
                className="child"
                bsStyle={'warning'}
                bsSize={'small'}
                disabled={!selectedNode}
                // tslint:disable-next-line jsx-no-lambda
                onClick={() =>
                  handleUpdateD3Model(ModelType.COVARIABLE, selectedNode)
                }
              >
                {d3Model.covariables &&
                selectedNode &&
                d3Model.covariables.filter(c =>
                  selectedNode.leaves().includes(c)
                ).length === selectedNode.leaves().length
                  ? '-'
                  : '+'}{' '}
                AS COVARIABLE
              </Button>
            </Buttons>

            <ModelView
              d3Model={d3Model}
              handleUpdateD3Model={handleUpdateD3Model}
              handleSelectNode={handleSelectNode}
              zoom={zoom}
            />
          </Panel.Body>
        </Panel>
      </div>
    </div>
  );
};
