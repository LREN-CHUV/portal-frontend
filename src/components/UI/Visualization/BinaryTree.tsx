import * as d3 from 'd3';
import React, { useRef } from 'react';
import styled from 'styled-components';

import renderLifeCycle from '../../Explore/renderLifeCycle';

const nodeRectSize = { width: 80, height: 50 };
const svgSize = { width: 1800, height: 1000, margin: 100 };

const SVGContainer = styled.svg`
  width: 1800px;
  height: 1000px;

  .node,
  .edge {
    cursor: default;
  }

  .node:hover {
    stroke-width: 0px;
  }

  .node rect {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 3px;
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

interface TreeNode {
  right: TreeNode | string;
  left: TreeNode | string;
  colName: string;
  samples?: string;
}

interface Nodes {
  data: object;
  childnodes?: Nodes[];
  colname: string;
}

const makeNodes = (data: TreeNode): Nodes[] => {
  const childnodes = [
    {
      data,
      ...(data.left !== 'None' && {
        childnodes: makeNodes(data.left as TreeNode)
      }),
      colname: data.colName || ''
    },
    {
      data: data,
      ...(data.right !== 'None' && {
        childnodes: makeNodes(data.right as TreeNode)
      }),
      colname: data.samples || ''
    }
  ];

  return childnodes;
};

export default ({ data }: { data: TreeNode }): JSX.Element => {
  const svgRef = useRef(null);

  renderLifeCycle({
    firstRender: () => {
      if (!svgRef.current) {
        return;
      }

      if (!data) {
        return;
      }

      const nextData = {
        childnodes: makeNodes(data),
        colname: data.colName ? data.colName : ''
      };

      const width = svgSize.width;
      const height = svgSize.height;

      const treemap = d3
        .tree()
        .size([width, height])
        .separation((a: any, b: any) => (a.parent === b.parent ? 1 : 1.5))
        .nodeSize([nodeRectSize.width, nodeRectSize.height]);

      const root = d3.hierarchy(nextData, (d: any) => d.childnodes);
      const nodes = treemap(root);

      // append the svg object to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      const svg = d3
        .select(svgRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${width},${0})`);

      const g = svg.append('g').attr('transform', `translate(100,100)`);

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

      node
        .append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => (d.children ? -13 : 13))
        .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
        .text((d: any) => d.data.colname);

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
    }
  });

  return (
    <>
      <SVGContainer ref={svgRef} />
      {/* <pre>{data && JSON.stringify(data, null, 4)}</pre> */}
    </>
  );
};
