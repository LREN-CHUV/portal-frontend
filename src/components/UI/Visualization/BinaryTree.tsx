import * as d3 from 'd3';
import React, { useRef } from 'react';
import styled from 'styled-components';

import { round } from '../../utils';

const nodeRectSize = { width: 240, height: 80 };
const fixedSize = { w: 800, h: 1000 };

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

interface Node {
  children?: Node[];
  info?: NodeData;
}

interface JSONNode extends Partial<NodeData> {
  right: JSONNode | string;
  left: JSONNode | string;
  colName: string;
  threshold: number;
  gain: number | string;
  samplesPerClass: object;
  class: string;
}

interface NodeData {
  isRight: string;
  variable: string;
  criterion: string;
  samples: string;
  value: string;
  class: string;
}

interface NodeAttribute {
  data: { info?: NodeData };
}

type HierarchyPointNode = d3.HierarchyPointNode<Node>;

// parsing JSON
const makeNodes = (data: JSONNode): Node[] | undefined => {
  const hasLeft = data.left !== undefined && data.left !== 'None';
  const hasRight = data.right !== undefined && data.right !== 'None';

  if (!hasLeft && !hasRight) {
    return undefined;
  }

  // Keep both object, existing or not, as placeholders for right|left
  const children = [
    {
      ...(hasLeft && {
        children: makeNodes(data.left as JSONNode),
        info: makeNodeData(data.left as JSONNode, false)
      })
    },
    {
      ...(hasRight && {
        children: makeNodes(data.right as JSONNode),
        info: makeNodeData(data.right as JSONNode, true)
      })
    }
  ];

  return children;
};

const makeNodeData = (data: JSONNode, isRight: boolean): NodeData => ({
  isRight: isRight ? 'True' : 'False',
  variable:
    (data.colName !== 'None' &&
      `${data.colName} <= ${round(data.threshold, 3)}`) ||
    '',
  criterion:
    (data.gain !== 'None' &&
      `${data.criterion} = ${round(data.gain as number, 3)}`) ||
    '',
  samples: `samples = ${data.samples}`,
  value: `value = [${Object.values(data.samplesPerClass).toString()}]`,
  class: `class = ${data.class.replace('u', '')}`
});

// TODO collapsible tree https://observablehq.com/@d3/collapsible-tree
export default ({ data }: { data: JSONNode }): JSX.Element => {
  const svgRef = useRef(null);
  const [, setLocalData] = React.useState(data);

  React.useLayoutEffect(() => {
    if (!svgRef.current || !data) {
      return;
    }

    const firstRender = (treeNode: Node): void => {
      const treemap = d3
        .tree()
        .separation(() => 1.2)
        .nodeSize([nodeRectSize.width, nodeRectSize.height * 2]);

      const root = d3.hierarchy(treeNode);
      const nodes = treemap(root) as HierarchyPointNode;

      const svg = d3
        .select(svgRef.current)
        .append<Element>('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('preserveAspectRatio', 'none')
        .attr('viewBox', `0 0 ${fixedSize.w} ${fixedSize.h}`)
        .call(
          d3
            .zoom()
            .scaleExtent([0, 10])
            .on('zoom', () => g.attr('transform', d3.event.transform))
        );

      const g = svg.append('g');

      // adds the links between the nodes
      g.selectAll('.link')
        .data(nodes.descendants().slice(1))
        .enter()
        .append('path')
        .attr(
          'class',
          (d: HierarchyPointNode) => (d?.data?.info && 'link') || 'hidden'
        )
        .attr(
          'd',
          (d: HierarchyPointNode) =>
            d?.parent &&
            `M ${d.x}, ${d.y} C ${d.x}, ${(d.y + d.parent.y) / 2} ${
              d.parent.x
            }, ${(d.y + d.parent.y) / 2} ${d.parent.x}, ${d.parent.y}`
        );

      // add labels on edges
      g.selectAll('.label')
        .data(nodes.descendants().slice(1))
        .enter()
        .append('text')
        .attr(
          'transform',
          (d: HierarchyPointNode) =>
            d?.parent &&
            `translate(${(d.parent.x + d.x) / 2},${(d.parent.y + d.y) / 2})`
        )
        .style('text-anchor', 'middle')
        .text((d: HierarchyPointNode) => d?.data.info?.isRight || '');

      // adds each node as a group
      const node = g
        .selectAll('.node')
        .data(nodes.descendants())
        .enter()
        .append('g')
        .attr(
          'class',
          (d: HierarchyPointNode) => (d?.data?.info && 'node') || 'hidden'
        )
        .attr(
          'transform',
          (d: HierarchyPointNode) => d && `translate(${d.x},${d.y})`
        );

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
        .style('text-anchor', 'start')
        .text((d: HierarchyPointNode) => d?.data.info?.variable || '')
        .append('tspan')
        .attr('x', x)
        .attr('y', y + 12)
        .text((d: HierarchyPointNode) => d?.data.info?.criterion || '')
        .append('tspan')
        .attr('x', x)
        .attr('y', y + 24)
        .text((d: HierarchyPointNode) => d?.data.info?.samples || '')
        .append('tspan')
        .attr('x', x)
        .attr('y', y + 36)
        .text((d: HierarchyPointNode) => d?.data.info?.value || '')
        .append('tspan')
        .attr('x', x)
        .attr('y', y + 50)
        .text((d: HierarchyPointNode) => d?.data.info?.class || '');
    };

    const updateRender = (treeData: Node): void => {
      d3.select(svgRef.current)
        .selectAll('svg')
        .remove();

      firstRender(treeData);
    };

    // update or render
    setLocalData(previousData => {
      const treeNode: Node = {
        children: makeNodes(data),
        info: makeNodeData(data, true)
      };

      if (previousData !== data) {
        updateRender(treeNode);

        return data;
      } else {
        firstRender(treeNode);

        return previousData;
      }
    });
  }, [data]);

  return (
    <div>
      <SVGContainer ref={svgRef} />
    </div>
  );
};
