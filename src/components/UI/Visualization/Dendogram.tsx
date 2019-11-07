import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const SVGContainer = styled.svg`
  width: 1000px;
  height: 400px;

  .node {
    cursor: pointer;
  }

  .node circle {
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

const data = {
  childnodes: [
    {
      edge: '+80y',
      childnodes: [
        { leafval: 'Other,AD,CN', edge: 'F' },
        { leafval: 'Other,AD,CN', edge: 'M' }
      ],
      colname: 'gender'
    },
    {
      edge: '50-59y',
      childnodes: [
        { leafval: 'Other,AD,CN', edge: 'F' },
        { leafval: 'Other,AD,CN', edge: 'M' }
      ],
      colname: 'gender'
    },
    {
      edge: '60-69y',
      childnodes: [
        { leafval: 'Other,CN,AD', edge: 'F' },
        { leafval: 'Other,CN,AD', edge: 'M' }
      ],
      colname: 'gender'
    },
    {
      edge: '70-79y',
      childnodes: [
        { leafval: 'CN,Other,AD', edge: 'F' },
        { leafval: 'CN,Other,AD', edge: 'M' }
      ],
      colname: 'gender'
    }
  ],
  colname: 'agegroup'
};

export default (): JSX.Element => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    const margin = { top: 10, right: 100, bottom: 10, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const treemap = d3.tree().size([height, width]);

    let nodes: any = d3.hierarchy(data, (d: any) => d.childnodes);
    nodes = treemap(nodes);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3
      .select(svgRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // adds the links between the nodes
    const link = g
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        (d: any) =>
          `M ${d.y}, ${d.x} C ${(d.y + d.parent.y) / 2}, ${d.x} ${(d.y +
            d.parent.y) /
            2}, ${d.parent.x} ${d.parent.y}, ${d.parent.x}`
      );

    const edge = g
      .selectAll('.edge')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('text')
      .attr('class', 'edge')
      .attr('transform', (d: any) => `translate(${d.y - 120},${d.x})`)
      .text(function(d: any) {
        return d.data.edge;
      });

    // adds each node as a group
    const node = g
      .selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', function(d: any) {
        return 'node' + (d.children ? ' node--internal' : ' node--leaf');
      })
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle').attr('r', 10);

    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => (d.children ? -13 : 13))
      .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => d.data.colname || d.data.leafval);
  }, [svgRef]);

  return <SVGContainer ref={svgRef} />;
};
