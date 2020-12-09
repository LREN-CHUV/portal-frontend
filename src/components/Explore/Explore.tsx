import React, { useCallback } from 'react';
import { Button, Card, Dropdown, DropdownButton } from 'react-bootstrap';
import { BsFillCaretRightFill } from 'react-icons/bs';
import styled from 'styled-components';
import { APICore, APIMining, APIModel, APIExperiment } from '../API';
import { VariableEntity } from '../API/Core';
import { D3Model, HierarchyCircularNode, ModelResponse } from '../API/Model';
import { ONTOLOGY_URL } from '../constants';
import AvailableAlgorithms from '../Create/AvailableAlgorithms';
import DropdownModel from '../UI/DropdownModel';
import LargeDatasetSelect from '../UI/LargeDatasetSelect';
import { ModelType } from './Container';
import Histograms from './D3Histograms';
import ModelView from './D3Model';
import Search from './D3Search';
import ExperimentList from '../UI/ExperimentList2';
import { ExperimentListQueryParameters, IExperiment } from '../API/Experiment';

const DataSelectionBox = styled(Card.Title)`
  display: flex;
  padding: 0.4em;
  margin-bottom: 4px;
  justify-content: space-between;
  align-items: start;
  background-color: #eee;
`;

const PathologiesBox = styled.div`
  margin-top: 4px;
  font-size: 14px;
  flex: 0 1 1;
`;

const DatasetsBox = styled.div`
  margin-top: 4px;
  font-size: 14px;
  margin-left: 8px;
  flex: 0 1 1;
`;

const SearchBox = styled.div`
  margin-top: 4px;
  margin-left: 8px;
  flex: 2;
  /* width: 320px; */
`;

const ModelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0 0 8px 0;
  padding: 0 0 8px 0;
  border-bottom: 1px solid lightgray;

  .dropdown {
    flex: 2;
  }

  h5 {
    font-weight: bold;
    margin-right: 8px;
  }
`;

const Grid = styled.div`
  display: flex;
  justify-content: center;
`;

const Col2 = styled.div`
  flex: 1;
`;

const Col1 = styled(Col2)`
  margin-right: 8px;
  flex: 1;
`;

export interface ExploreProps {
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  apiExperiment: APIExperiment;
  children?: any;
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
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
    apiExperiment,
    children,
    layout,
    selectedNode,
    histograms,
    d3Model,
    handleSelectNode,
    handleSelectPathology,
    handleUpdateD3Model,
    handleSelectModel,
    handleGoToAnalysis,
    zoom
    // setFormulaString
  } = props;

  const model = apiModel.state.model;
  const selectedDatasets = model?.query?.trainingDatasets || [];
  const selectedPathology = model?.query?.pathology || '';
  const datasets = apiCore.state.pathologiesDatasets[selectedPathology];

  const variablesForPathologyDict = apiCore.state.pathologiesVariables;
  const variablesForPathology: VariableEntity[] | undefined =
    (selectedPathology &&
      variablesForPathologyDict &&
      variablesForPathologyDict[selectedPathology]) ||
    undefined;
  const independantsVariables =
    variablesForPathology &&
    variablesForPathology.filter((v: any) => v.isCategorical);

  const q = useCallback(
    ({ ...params }: ExperimentListQueryParameters): Promise<void> =>
      apiExperiment.list({ ...params }),
    [apiExperiment]
  );

  return (
    <>
      <Grid>
        <Col1>
          <Card>
            <DataSelectionBox>
              <PathologiesBox>
                {apiCore.state.pathologies &&
                  apiCore.state.pathologies.length > 1 && (
                    <DropdownButton
                      size="sm"
                      id="dropdown-pathology"
                      variant="light"
                      title={selectedPathology || 'Pathology'}
                    >
                      {apiCore.state.pathologies.map((g, i: number) => (
                        <Dropdown.Item
                          onSelect={(): void => {
                            handleSelectPathology(g.code);
                          }}
                          eventKey={`${i}`}
                          key={`${g.code}`}
                          value={g.code}
                        >
                          {g.label}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  )}
              </PathologiesBox>

              <DatasetsBox>
                <LargeDatasetSelect
                  datasets={datasets}
                  handleSelectDataset={apiModel.selectDataset}
                  selectedDatasets={selectedDatasets}
                  isDropdown={true}
                ></LargeDatasetSelect>
              </DatasetsBox>
              <SearchBox>
                <Search
                  hierarchy={layout}
                  zoom={zoom}
                  handleSelectNode={handleSelectNode}
                />
              </SearchBox>
            </DataSelectionBox>
            <Card.Body style={{ margin: 0, padding: 0 }}>{children}</Card.Body>
          </Card>
        </Col1>
        <Col2>
          <Card>
            <Card.Body>
              <ModelTitle>
                <h4 style={{ marginRight: '8px' }}>Parameters</h4>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-model-experiments"
                  >
                    Select
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <ExperimentList
                      experimentList={apiExperiment.state.experimentList}
                      handleQueryParameters={q}
                    />
                  </Dropdown.Menu>
                </Dropdown>
                {/*                 <DropdownModel
                  items={apiModel.state.models}
                  selectedSlug={
                    apiModel.state.model && apiModel.state.model.slug
                  }
                  reset={apiModel.state.model ? true : false}
                  handleSelect={handleSelectModel}
                /> */}

                <div className="item">
                  <Button
                    variant="info"
                    type="submit"
                    onClick={handleGoToAnalysis}
                  >
                    Descriptive Analysis <BsFillCaretRightFill />
                  </Button>
                </div>
              </ModelTitle>
              <p style={{ padding: '4px 0 8px 0' }}>
                <a
                  href={`${ONTOLOGY_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b>Access to the latest ontology and terminology</b>
                </a>
              </p>
              <ModelView
                d3Model={d3Model}
                handleUpdateD3Model={handleUpdateD3Model}
                handleSelectNode={handleSelectNode}
                zoom={zoom}
                buttonVariable={
                  <Button
                    className="child"
                    variant={'success'}
                    size="sm"
                    disabled={
                      !selectedNode || selectedNode.data.code === 'root'
                    }
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
                    As variable
                  </Button>
                }
                buttonCovariable={
                  <Button
                    className="child"
                    variant={'warning'}
                    size="sm"
                    disabled={
                      !selectedNode || selectedNode.data.code === 'root'
                    }
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
                    As covariable
                  </Button>
                }
                buttonFilter={
                  <Button
                    className="child"
                    variant={'secondary'}
                    size="sm"
                    disabled={
                      !selectedNode || selectedNode.data.code === 'root'
                    }
                    // tslint:disable-next-line jsx-no-lambda
                    onClick={() =>
                      handleUpdateD3Model(ModelType.FILTER, selectedNode)
                    }
                  >
                    {d3Model.filters &&
                    selectedNode &&
                    d3Model.filters.filter(c =>
                      selectedNode.leaves().includes(c)
                    ).length === selectedNode.leaves().length
                      ? '-'
                      : '+'}{' '}
                    As filter
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

              <h5 style={{ paddingTop: '4px' }}>Available algorithms</h5>
              <AvailableAlgorithms
                layout={'inline'}
                algorithms={apiCore.state.algorithms}
                lookup={apiCore.lookup}
                apiModel={apiModel}
              />
            </Card.Body>
          </Card>

          <Card className="statistics">
            <Card.Body>
              <Histograms
                apiMining={apiMining}
                histograms={histograms}
                independantsVariables={independantsVariables}
                selectedNode={selectedNode}
                handleSelectedNode={handleSelectNode}
                zoom={zoom}
                model={model}
              />
            </Card.Body>
          </Card>
        </Col2>
      </Grid>
    </>
  );
};
