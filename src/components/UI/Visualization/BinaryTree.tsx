import * as d3 from 'd3';
import React, { useRef } from 'react';
import styled from 'styled-components';

import { round } from '../../utils';

const nodeRectSize = { width: 160, height: 80 };
const svgSize = { width: 800, height: 1000, margin: 100, vmargin: 10 };

const SVGContainer = styled.div`
  width: 100%;
  height: 100%;

  .node {
    cursor: grab;
  }

  .node:hover {
    stroke-width: 0px;
  }

  .node rect {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 2px;
  }

  .node text {
    font: 12px sans-serif;
  }

  .link {
    fill: none;
    stroke: #ccc;
    stroke-width: 2px;
  }
`;

interface Nodes {
  childnodes?: Nodes[];
  info?: NodeData;
}

interface TreeNode extends Partial<NodeData> {
  right: TreeNode | string;
  left: TreeNode | string;
  colName: string;
  threshold: number;
  gain: number;
  samplesPerClass: object;
  class: string;
}

interface NodeData {
  variable: string;
  criterion: string;
  samples: string;
  value: string;
  class: string;
}

const makeNodes = (data: TreeNode): Nodes[] | object => {
  if (data.left === 'None' && data.right === 'None') {
    return {};
  }

  const childnodes = [
    data.left !== 'None'
      ? {
          childnodes: makeNodes(data.left as TreeNode),
          info: makeNodeData(data.left as TreeNode)
        }
      : {},
    data.right !== 'None'
      ? {
          childnodes: makeNodes(data.right as TreeNode),
          info: makeNodeData(data.right as TreeNode)
        }
      : {}
  ];

  return childnodes;
};

const makeNodeData = (data: TreeNode): NodeData => ({
  variable: `${data.colName} <= ${round(data.threshold, 3)}`,
  criterion: `${data.criterion} = ${round(data.gain, 3)}`,
  samples: `samples = ${data.samples}`,
  value: `value = [${Object.values(data.samplesPerClass).toString()}]`,
  class: `class = ${data.class.replace('u', '')}`
});

export default ({ data }: { data: TreeNode }): JSX.Element => {
  const svgRef = useRef(null);
  const isFirstRender = useRef(false);

  React.useLayoutEffect(() => {
    if (!svgRef.current || !data || isFirstRender.current) {
      return;
    }

    isFirstRender.current = true;

    const nextData = {
      childnodes: makeNodes(data),
      info: makeNodeData(data)
    };

    console.log(nextData);

    const width = svgSize.width;
    const height = svgSize.height;

    const treemap = d3
      .tree()
      .separation(() => 1.2)
      .nodeSize([nodeRectSize.width, nodeRectSize.height * 2]);

    const root = d3.hierarchy(nextData, (d: any) => d.childnodes);
    const nodes = treemap(root);

    const svg = d3
      .select(svgRef.current)
      .append<Element>('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .call(
        d3
          .zoom()
          .scaleExtent([0, 10])
          .on('zoom', () => g.attr('transform', d3.event.transform))
      );

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${nodeRectSize.height})`);

    // adds the links between the nodes
    g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        (d: any) =>
          `M ${d.x}, ${d.y} C ${d.x}, ${(d.y + d.parent.y) / 2} ${
            d.parent.x
          }, ${(d.y + d.parent.y) / 2} ${d.parent.x}, ${d.parent.y}`
      );

    // adds each node as a group
    const node = g
      .selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    node
      .append('rect')
      .attr('x', -nodeRectSize.width / 2)
      .attr('y', -nodeRectSize.height / 2)
      .attr('width', nodeRectSize.width)
      .attr('height', nodeRectSize.height);

    const x = -nodeRectSize.width / 2 + 10;
    const y = -nodeRectSize.height / 2 + 20;

    node
      .append('text')
      .attr('x', x)
      .attr('y', y)
      .style('text-anchor', (d: any) => 'start')
      .text((d: any) => d.data.info?.variable)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 12)
      .text((d: any) => d.data.info?.criterion)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 24)
      .text((d: any) => d.data.info?.samples)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 36)
      .text((d: any) => d.data.info?.value)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 50)
      .text((d: any) => d.data.info?.class);
  }, [data]);

  return (
    <div>
      <SVGContainer ref={svgRef} />
      <pre>{data && JSON.stringify(data, null, 4)}</pre>
    </div>
  );
};
