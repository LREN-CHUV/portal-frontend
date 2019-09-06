import * as d3 from 'd3';
import React, { useRef } from 'react';
import { D3Model, HierarchyCircularNode, ModelType } from './Container';
import renderLifeCycle from './renderLifeCycle';

export interface ModelProps {
  children?: any;
  handleUpdateD3Model: Function;
  handleSelectNode: Function;
  d3Model: D3Model;
  zoom: Function;
}

export default (props: ModelProps) => {
  const variableRef = useRef(null);
  const covariableRef = useRef(null);
  const { d3Model: model, handleUpdateD3Model, handleSelectNode, zoom } = props;

  const makeTree = (variables: HierarchyCircularNode[], type: ModelType) => {
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
        handleUpdateD3Model(type, d, true);
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

      if (model && model.variable) {
        makeTree(model.variable.descendants(), ModelType.VARIABLE);
      }

      if (model && model.covariables) {
        makeTree(model.covariables, ModelType.COVARIABLE);
      }
    }
  });

  return (
    <>
      <h5>Variables</h5>
      <div ref={variableRef} />
      <h5>Covariables</h5>
      <div ref={covariableRef} />
    </>
  );
};
