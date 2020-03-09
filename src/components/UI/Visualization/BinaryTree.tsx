import * as d3 from 'd3';
import React, { useRef } from 'react';
import styled from 'styled-components';

import { round } from '../../utils';

const nodeRectSize = { width: 160, height: 80 };
const svgSize = { width: 1800, height: 1000, margin: 100, vmargin: 10 };

const SVGContainer = styled.svg`
  width: 1800px;
  height: 1000px;

  .node {
    cursor: default;
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

interface TreeNode {
  right: TreeNode | string;
  left: TreeNode | string;
}

interface Nodes {
  childnodes?: Nodes[];
  info: NodeInfo;
}

interface NodeInfo {
  variable: string;
  criterion: string;
  samples: string;
  value: string;
  class: string;
}

const makeNodes = (data: TreeNode): Nodes[] => {
  const childnodes = [
    {
      ...(data.left !== 'None' && {
        childnodes: makeNodes(data.left as TreeNode)
      }),
      info: makeNodeInfo(data)
    },
    {
      ...(data.right !== 'None' && {
        childnodes: makeNodes(data.right as TreeNode)
      }),
      info: makeNodeInfo(data)
    }
  ];

  return childnodes;
};

const makeNodeInfo = (data: any): NodeInfo => {
  const info = {
    variable: `${data.colName} <= ${round(data.threshold, 3)}`,
    criterion: `${data.criterion} = ${round(data.gain, 3)}`,
    samples: `samples = ${data.samples}`,
    value: `value = [${Object.values(data.samplesPerClass).toString()}]`,
    class: `class = ${data.class.replace('u', '')}`
  };

  return info;
};

export default ({ data }: { data: TreeNode }): JSX.Element => {
  const svgRef = useRef(null);

  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    if (!data) {
      return;
    }

    const nextData = {
      childnodes: makeNodes(data),
      info: makeNodeInfo(data)
    };

    const width = svgSize.width;
    const height = svgSize.height;

    const treemap = d3
      .tree()
      .size([width, height])
      .separation(() => 1.2)
      .nodeSize([nodeRectSize.width, nodeRectSize.height + 40]);

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
      // .call(
      //   d3.zoom().on('zoom', function() {
      //     svg.attr('transform', d3.event.transform);
      //   })
      // );

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
      .text((d: any) => d.data.info.variable)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 12)
      .text((d: any) => d.data.info.criterion)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 24)
      .text((d: any) => d.data.info.samples)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 36)
      .text((d: any) => d.data.info.value)
      .append('tspan')
      .attr('x', x)
      .attr('y', y + 50)
      .text((d: any) => d.data.info.class);
  }, [data]);

  return (
    <div style={{ overflow: 'auto' }}>
      <SVGContainer ref={svgRef} />
      {/* <pre>{data && JSON.stringify(data, null, 4)}</pre> */}
    </div>
  );
};
