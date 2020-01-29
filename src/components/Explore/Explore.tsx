import * as React from 'react';
import { Button, Checkbox, Glyphicon, Panel } from 'react-bootstrap';
import styled from 'styled-components';
import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import AvailableAlgorithms from '../Create/AvailableAlgorithms';
import DropdownModel from '../UI/DropdownModel';
import { D3Model, HierarchyCircularNode, ModelType } from './Container';
import Histograms from './D3Histograms';
import ModelView from './D3Model';
import Search from './D3Search';

const TitleBox = styled(Panel.Title)`
  display: flex;
  padding: 0.4em;
  margin-bottom: 4px;
  justify-content: space-between;
  align-items: center;
  background-color: #eee;
`;

const SearchBox = styled.div`
  width: 320px;
`;

const PanelTitle = styled(Panel.Title)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 0 0;
`;

const ModelTitle = styled.div`
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
    font-weight: bold;
    margin-right: 8px;
  }
`;

const style = {
  display: 'flex',
  justifyContent: 'space-between'
};

const PathologyBox = styled.div`
  margin-top: 4px;
  font-size: 14px;
  label {
    margin-left: 16px;
    font-weight: normal;
  }
`;

const DatasetsBox = styled.div`
  margin: 8px;
  padding: 1em;
  background-color: #eeeeee99;
  position: absolute;
`;

export interface ExploreProps {
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  children?: any;
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectPathology: (code: string) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleUpdateD3Model: (
    model?: ModelType,
    node?: HierarchyCircularNode
  ) => void;
  handleSelectModel: (model?: ModelResponse) => void;
  handleGoToAnalysis: any; // FIXME Promise<void>
  zoom: (circleNode: HierarchyCircularNode) => void;
  setFormulaString: (f: string) => void;
}

export default (props: ExploreProps): JSX.Element => {
  const {
    apiCore,
    apiModel,
    apiMining,
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
    zoom,
    setFormulaString
  } = props;

  const model = apiModel.state.model;
  const selectedDatasets =
    (model && model.query && model.query.trainingDatasets) || [];
  const selectedPathology = model && model.query && model.query.pathology;
  const datasets = apiCore.datasetsForPathology(selectedPathology);

  const variablesForPathology = apiCore.variablesForPathology(
    selectedPathology
  );
  const independantsVariables =
    variablesForPathology &&
    variablesForPathology.filter((v: any) => v.isCategorical);

  return (
    <>
      <div style={style}>
        <div style={{ flex: 1, marginRight: '8px' }}>
          <Panel>
            <TitleBox>
              <PathologyBox>
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
              </PathologyBox>
              <SearchBox>
                <Search
                  hierarchy={layout}
                  zoom={zoom}
                  handleSelectNode={handleSelectNode}
                />
              </SearchBox>
            </TitleBox>
            <DatasetsBox>
              <p>
                <b>Datasets</b>
              </p>
              {datasets &&
                datasets.map((dataset: any) => (
                  <div key={dataset.code}>
                    <Checkbox
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
                  </div>
                ))}
            </DatasetsBox>
            <Panel.Body style={{ margin: 0, padding: 0 }}>
              {children}
            </Panel.Body>
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
          </Panel>
          <Panel>
            <Panel.Body>
              {/* <Tabs defaultActiveKey={0} id="uncontrolled-formula-tabs">
                <Tab eventKey={0} title={'Parameters'} key={0}> */}
              <ModelTitle>
                <h5>Parameters</h5>
                <DropdownModel
                  items={apiModel.state.models}
                  selectedSlug={
                    apiModel.state.model && apiModel.state.model.slug
                  }
                  reset={apiModel.state.model ? true : false}
                  handleSelect={handleSelectModel}
                />
              </ModelTitle>
              <ModelView
                d3Model={d3Model}
                handleUpdateD3Model={handleUpdateD3Model}
                handleSelectNode={handleSelectNode}
                zoom={zoom}
                buttonVariable={
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
                    d3Model.variables.filter(c =>
                      selectedNode.leaves().includes(c)
                    ).length === selectedNode.leaves().length
                      ? '-'
                      : '+'}{' '}
                    AS VARIABLE
                  </Button>
                }
                buttonCovariable={
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
                }
              />
              {/* </Tab>
                <Tab eventKey={1} title={'Formula'} key={1}>
                  <Formula
                    parameters={d3Model}
                    handleUpdateD3Model={handleUpdateD3Model}
                    setFormulaString={setFormulaString}
                  />
                </Tab>
              </Tabs> */}
              Available algorithms:{' '}
              <AvailableAlgorithms
                layout={'inline'}
                algorithms={apiCore.state.algorithms}
                lookup={apiCore.lookup}
                handleSelectMethod={() => {}}
                model={apiModel.state.model}
              />
            </Panel.Body>
          </Panel>

          <Panel className="statistics">
            <Panel.Body>
              <Histograms
                apiMining={apiMining}
                histograms={histograms}
                independantsVariables={independantsVariables}
                selectedNode={selectedNode}
                handleSelectedNode={handleSelectNode}
                zoom={zoom}
              />
            </Panel.Body>
          </Panel>
        </div>
      </div>
    </>
  );
};
