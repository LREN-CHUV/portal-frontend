import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const SVGContainer = styled.svg`
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

/* tslint:disable */
export default (): JSX.Element => {
  const svgRef = useRef(null);

  useEffect(() => {
    // set the dimensions and margins of the diagram
    if (!svgRef.current) {
      return;
    }
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 200 - margin.left - margin.right;
    const height = 100 - margin.top - margin.bottom;

    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    //  assigns the data to a hierarchy using parent-child relationships
    let nodes: any = d3.hierarchy(data, (d: any) => d.childnodes);

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3
        .select(svgRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom),
      g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // adds the links between the nodes
    var link = g
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', function(d: any) {
        return (
          'M' +
          d.y +
          ',' +
          d.x +
          'C' +
          (d.y + d.parent.y) / 2 +
          ',' +
          d.x +
          ' ' +
          (d.y + d.parent.y) / 2 +
          ',' +
          d.parent.x +
          ' ' +
          d.parent.y +
          ',' +
          d.parent.x
        );
      });

    // adds each node as a group
    var node = g
      .selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', function(d: any) {
        return 'node' + (d.children ? ' node--internal' : ' node--leaf');
      })
      .attr('transform', function(d: any) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // adds the circle to the node
    node.append('circle').attr('r', 10);

    // adds the text to the node
    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', function(d: any) {
        return d.children ? -13 : 13;
      })
      .style('text-anchor', function(d: any) {
        return d.children ? 'end' : 'start';
      })
      .text(function(d: any) {
        return d.data.colname || d.data.leafval;
      });
  }, [svgRef]);

  return <SVGContainer ref={svgRef} />;
};
