import * as d3 from 'd3';
import React, { useRef } from 'react';
import { D3Model, HierarchyCircularNode, ModelType } from './Container';
import renderLifeCycle from './renderLifeCycle';
import styled from 'styled-components';

export interface ModelProps {
  children?: any;
  handleUpdateD3Model: (model: ModelType, node: HierarchyCircularNode) => void;
  handleSelectNode: Function;
  d3Model: D3Model;
  zoom: Function;
  buttonVariable: JSX.Element;
  buttonCovariable: JSX.Element;
}

const Wrapper = styled.div`
  display: flex;
  height: 120px;

  button {
    margin-bottom: 4px;
    flex: 1;
    margin-right: 4px;
  }

  div {
    flex: 1;
  }

  span {
    margin-right: 4px;
    cursor: pointer;
  }

  p {
    margin: 0;
  }

  div div {
    padding: 0 1em;
    margin: 0 0 4px 0;
    border: 1px solid #ddd;
    height: 84px;
    overflow-y: auto;
  }

  div div a {
    cursor: pointer;
  }
`;

export default (props: ModelProps) => {
  const variableRef = useRef(null);
  const covariableRef = useRef(null);
  const {
    d3Model: model,
    handleUpdateD3Model,
    handleSelectNode,
    zoom,
    buttonVariable,
    buttonCovariable
  } = props;

  const makeTree = (
    variables: HierarchyCircularNode[],
    type: ModelType
  ): void => {
    const ref =
      type === ModelType.COVARIABLE
        ? covariableRef.current
        : variableRef.current;

    const block = d3
      .select(ref)
      .selectAll('p')
      .data(variables)
      .join('p');

    const span = block.append('span');

    span
      .append('a')
      .text('x')
      .on('click', d => {
        handleUpdateD3Model(type, d);
        d3.event.stopPropagation();
      });

    block
      .append('a')
      .text(d => `${d.data.label} (${d.data.type})`)
      .on('click', d => {
        handleSelectNode(d);

        d3.event.stopPropagation();
        zoom(d);
      });
  };

  renderLifeCycle({
    updateRender: () => {
      d3.select(variableRef.current)
        .selectAll('p')
        .remove();

      d3.select(covariableRef.current)
        .selectAll('p')
        .remove();

      if (model && model.variables) {
        makeTree(model.variables, ModelType.VARIABLE);
      }

      if (model && model.covariables) {
        makeTree(model.covariables, ModelType.COVARIABLE);
      }
    }
  });

  return (
    <Wrapper>
      <div>
        {buttonVariable}
        <div ref={variableRef} />
      </div>
      <div>
        {buttonCovariable}
        <div ref={covariableRef} />
      </div>
    </Wrapper>
  );
};
