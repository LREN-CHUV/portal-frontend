import './CirclePack.css';

import * as d3 from 'd3';
import React, { useRef } from 'react';

import { HierarchyCircularNode, Model } from './Container';
import { HierarchyNode, VariableDatum } from './d3Hierarchy';
import { renderLifeCycle } from './renderLifeCycle';

interface Props {
  hierarchy: HierarchyNode;
  // handleSelectNode: (node: HierarchyCircularNode) => void;
  // model: Model;
  // selectedNode: HierarchyCircularNode | undefined;
}

export default (props: Props) => {
  const divRef = useRef(null);

  const { hierarchy } = props;

  renderLifeCycle({
    firstRender: () => {
      d3.select(divRef.current)
        .selectAll('.shortcut')
        .data(hierarchy.descendants())
        .join('a')
        .style('fill-opacity', d => (d.parent === hierarchy ? 1 : 0))
        .style('display', d => (d.parent === hierarchy ? 'inline' : 'none'))
        .text(d => d.data.label);
      // .on('click', d => {
      //   zoom(d);
      // });
    },
    // updateRender: () => {
    // },
    lastRender: () => console.log('im out', hierarchy)
  });

  return <div ref={divRef} />;
};
