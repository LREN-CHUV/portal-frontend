import React from 'react';
import { Button, Checkbox, Panel } from 'react-bootstrap';
import { VariableEntity } from '../API/Core';
import { HierarchyCircularNode, Model, ModelType } from './Container';
import { HierarchyNode } from './d3Hierarchy';
import './Explore.css';
import Histograms from './Histograms';
import Shortcuts from './Shortcuts';

export interface ExploreProps {
  children?: any;
  datasets?: VariableEntity[];
  selectedDatasets: VariableEntity[];
  selectedNode: HierarchyCircularNode | undefined;
  hierarchy: HierarchyNode;
  histograms?: any;
  model: Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleChangeModel: (
    type: ModelType,
    node?: HierarchyNode,
    remove?: boolean
  ) => void;
  zoom: Function;
}

export default (props: ExploreProps) => {
  const {
    children,
    hierarchy,
    datasets,
    selectedDatasets,
    selectedNode,
    histograms,
    model,
    handleSelectNode,
    handleSelectDataset,
    handleChangeModel,
    zoom
  } = props;
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
              <h6>Shortcuts</h6>
              <Shortcuts hierarchy={hierarchy} zoom={zoom}  />
              {children}
            </Panel.Body>
          </Panel>
        </div>
        <div className='column'>
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
          <Panel className='model'>
            <Panel.Title>
              <h3>Model</h3>
            </Panel.Title>
            <Panel.Body className='model-body'>
              <div className='model variable'>
                <Button
                  bsStyle={'info'}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => handleChangeModel(ModelType.VARIABLE)}>
                  + AS VARIABLE
                </Button>
                {model.variable && (
                  <p>
                    <Button
                      bsStyle={'link'}
                      // tslint:disable-next-line jsx-no-lambda
                      onClick={() =>
                        handleChangeModel(
                          ModelType.VARIABLE,
                          model.variable,
                          true
                        )
                      }>
                      X
                    </Button>

                    <a
                      // tslint:disable-next-line jsx-no-lambda
                      onClick={() => {
                        // if (model.variable) {
                        //   handleSelectVariable(model.variable);
                        // }
                      }}>
                      {model.variable.data.label}
                    </a>
                  </p>
                )}
              </div>
              <div className='model covariable'>
                <Button
                  bsStyle={'info'}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => handleChangeModel(ModelType.COVARIABLE)}>
                  + AS COVARIABLE
                </Button>
                <div>
                  <p>Nominal</p>
                  {model.covariables &&
                    model.covariables.map((c, i) => (
                      <p key={`p-${i}`}>
                        <Button
                          bsStyle={'link'}
                          key={`$btn-{i}`}
                          // tslint:disable-next-line jsx-no-lambda
                          onClick={() =>
                            handleChangeModel(ModelType.COVARIABLE, c, true)
                          }>
                          X
                        </Button>
                        <a
                          key={`$var-{i}`}
                          // tslint:disable-next-line jsx-no-lambda
                          onClick={() => {
                            // if (c) {
                            //   handleSelectVariable(c);
                            // }
                          }}>
                          {c.data.label}
                        </a>
                      </p>
                    ))}
                  {/* <p>Continuous</p>
                  {model.groupings.map(c => (
                    <p>{c}</p>
                  ))} */}
                </div>
              </div>
              <div style={{ flexGrow: 1 }}>
                <Button
                  bsStyle={'info'}
                  // tslint:disable-next-line jsx-no-lambda
                  // onClick={() => handleChangeModel(ModelType.FILTER)}>
                >
                  + AS FILTER
                </Button>
                {/* {model.filters.map(c => (
                  <p>{c}</p>
                ))} */}
              </div>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    </div>
  );
};
