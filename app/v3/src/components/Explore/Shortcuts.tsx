import * as d3 from 'd3';
import React, { useRef, useState } from 'react';
import './CirclePack.css';
import { HierarchyCircularNode } from './Container';
import { renderLifeCycle } from './renderLifeCycle';

interface Props {
  hierarchy: HierarchyCircularNode;
  zoom: Function;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  // model: Model;
  // selectedNode: HierarchyCircularNode | undefined;
}

export default (props: Props) => {
  const divRef = useRef(null);
  const resultRef = useRef(null);
  const { hierarchy, zoom, handleSelectNode } = props;

  renderLifeCycle({
    firstRender: () => {
      d3.select(divRef.current)
        .selectAll('.shortcut')
        .data(hierarchy.descendants())
        .join('a')
        .style('fill-opacity', d => (d.parent === hierarchy ? 1 : 0))
        .style('display', d => (d.parent === hierarchy ? 'inline' : 'none'))
        .text(d => d.data.label)
        .on('click', d => {
          handleSelectNode(d);

          d3.event.stopPropagation();
          zoom(d);
        });
    }
  });

  const handleChangeInput = (e: any) => {
    const path = d3.select(resultRef.current).selectAll('a');
    if (!e.target.value) {
      path.remove();
      return;
    }
    const results: HierarchyCircularNode[] = [];
    hierarchy.each(node => {
      const regexp = new RegExp(e.target.value, 'ig');
      if (regexp.test(node.data.label)) {
        results.push(node);
      }
    });

    path.remove();
    d3.select(resultRef.current)
      .selectAll('a')
      .data(results)
      .enter()
      .append('a')
      .text(d => d.data.label)
      .on('click', d => {
        handleSelectNode(d);

        d3.event.stopPropagation();
        zoom(d);
      });
  };

  return (
    <>
      <input placeholder='Search' onChange={handleChangeInput} />
      <div className="d3-link" ref={resultRef} />
      <div className="d3-link" ref={divRef} />
    </>
  );
};
