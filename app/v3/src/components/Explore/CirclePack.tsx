import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const CirclePack = (props: any) => {
  const gRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    console.log(props);
    d3render();
  });

  const d3render = () => {
    const diameter = 500;
    const data = [
      ['bubble1', [10, 20]],
      ['bubble2', [5, 7]],
      ['bubble3', [6, 6, 10]],
      ['bubble4', [12, 14]],
      ['bubble5', [14, 4]],
      ['bubble6', [15, 5, 10]],
      ['bubble7', [10, 10]],
      ['bubble8', [25, 10]],
      ['bubble9', [10, 25, 10, 10]],
      ['bubble10', [55, 10]],
      ['bubble11', [10, 80, 10, 10]],
      ['bubble12', [50, 50]]
    ];

    const color = d3
      .scaleOrdinal()
      .range(['#f1eef6', '#bdc9e1', '#74a9cf', '#0570b0']);
    const pack = d3.pack().size([diameter, diameter]);
    const root = d3
      .hierarchy({ children: data })
      .sum((d: any) => (d.children ? 0 : d3.sum(d[1])));
    const nodeData = pack(root).children;

    // https://bl.ocks.org/jsl6906/6560687444d2e1421e4d24360c27728a
    const node = gRef.current;
    if (node) {
      const svg = d3
        .select(node)
        .enter()
        .append('g')
        .attr('width', diameter)
        .attr('height', diameter)
        .attr('class', 'bubble')
        .attr('transform', (d:any) => 'translate(' + d.x + ',' + d.y + ')');

      // const nodes = svg.selectAll('g.node').data(nodeData);

      // const nodeEnter = nodes
      //   .enter()
      //   .append('g')
      //   .attr('class', 'node')
      //   .attr('transform', function(d) {
      //     return 'translate(' + d.x + ',' + d.y + ')';
      //   });
    }
  };

  return <svg transform={`translate(10, 100)`} ref={gRef} />;
};

export default CirclePack;
