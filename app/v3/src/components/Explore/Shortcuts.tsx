import * as d3 from 'd3';
import React, { useRef } from 'react';
import './CirclePack.css';
import { HierarchyNode } from './d3Hierarchy';
import { renderLifeCycle } from './renderLifeCycle';

interface Props {
  hierarchy: HierarchyNode;
  zoom: Function;
  // handleSelectNode: (node: HierarchyCircularNode) => void;
  // model: Model;
  // selectedNode: HierarchyCircularNode | undefined;
}

export default (props: Props) => {
  const divRef = useRef(null);

  const { hierarchy, zoom } = props;

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
          // handleSelectNode(d)

          d3.event.stopPropagation()
          zoom(d);
        });
    }
  });

  return <div ref={divRef} />;
};
