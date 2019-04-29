import './Explore.css';

import { HierarchyNode } from 'd3';
import React from 'react';
import { Button, Checkbox, Panel } from 'react-bootstrap';

import { MIP } from '../../types';
import CirclePack from './CirclePack';
import { IModel, IVariableNode, ModelType } from './Container';
import Statistics from './Statistics';

interface IProps {
  datasets?: MIP.API.IVariableEntity[];
  selectedDatasets: MIP.API.IVariableEntity[];
  hierarchyNode?: IVariableNode;
  histograms?: any;
  model: IModel;
  handleSelectDataset: (e: any) => void;
  handleSelectVariable: (
    node: HierarchyNode<MIP.Internal.IVariableDatum>
  ) => void;
  handleChangeModel: (
    type: ModelType,
    node?: IVariableNode,
    remove?: boolean
  ) => void;
}

export default ({
  datasets,
  selectedDatasets,
  hierarchyNode,
  histograms,
  model,
  handleSelectVariable,
  handleSelectDataset,
  handleChangeModel
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
                model={model}
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
            <Panel.Body className='model-body'>
              <div style={{ flexGrow: 1 }}>
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
                        if (model.variable) {
                          handleSelectVariable(model.variable);
                        }
                      }}>
                      {model.variable.data.label}
                    </a>
                  </p>
                )}
              </div>
              <div style={{ flexGrow: 2 }}>
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
                        <a key={`$var-{i}`}
                          // tslint:disable-next-line jsx-no-lambda
                          onClick={() => {
                            if (c) {
                              handleSelectVariable(c);
                            }
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
