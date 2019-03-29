import './CirclePack.css';

import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const CirclePack = (props: any) => {
  const gRef = useRef<SVGSVGElement>(null);
  const diameter = 800;
  const padding = 1.5;

  let view: [number, number, number] = [0, 0, 0];
  let focus: any;

  useEffect(() => {
    if (props.hierarchy) {
      d3Render();
    }
  });

  const depthCount = (branch: any): number =>
    branch.children
      ? 1 + (d3.max<number>(branch.children.map(depthCount)) || 1)
      : 1;

  const d3Render = () => {
    const svgRef = gRef.current;

    if (svgRef) {
      const svg = d3
        .select(svgRef)
        .attr('width', diameter)
        .attr('height', diameter)
        .attr('class', 'circle-pack');

      const bubbleLayout = d3
        .pack()
        .size([diameter, diameter])
        .padding(padding);

      const data = d3.hierarchy(props.hierarchy).sum(d => {
        return d.name ? d.name.length : 1;
      });

      const color = d3
        .scaleLinear<string, string>()
        .domain([0, depthCount(data)])
        .range(['hsl(190,80%,80%)', 'hsl(228,80%,40%)'])
        .interpolate(d3.interpolateHcl);

      const nodes = svg
        .selectAll('g')
        .data(bubbleLayout(data).descendants())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

      nodes
        .append('circle')
        .attr('r', d => d.r)
        .attr('class', d =>
          d.parent ? (d.children ? 'node' : 'node node-leaf') : 'node node-root'
        )
        .style('fill', d => (d.children ? color(d.depth) : color(0.25)))
        .on('click', d => focus !== d && (zoom(d), d3.event.stopPropagation()));

      nodes
        .append('text')
        .attr('dy', '.3em')
        .attr('class', 'label')
        .style('fill-opacity', d => (d.parent === data ? 1 : 0))
        .style('display', d => (d.parent === data ? null : 'none'))
        .style('text-anchor', 'middle')
        .text((d: any) => d.data.name);

      const node = svg.selectAll('circle');

      const zoom = (d: any) => {
        const focus0 = focus;
        focus = d;

        const transition = d3
          .transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween('zoom', d => {
            // console.log(focus);
            const i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + padding
            ]);

            return t => zoomTo(i(t));
          });

        // transition
        //   .selectAll('text')
        //   .filter(function(d) {
        //     return d.parent === focus || this.style.display === 'inline';
        //   })
        //   .style('fill-opacity', function(d) {
        //     return d.parent === focus ? 1 : 0;
        //   })
        //   .each('start', function(d) {
        //     if (d.parent === focus) this.style.display = 'inline';
        //   })
        //   .each('end', function(d) {
        //     if (d.parent !== focus) this.style.display = 'none';
        //   });
      };

      const zoomTo = (v: any) => {
        console.log(v);
        const k = diameter / v[2];

        view = v;
        node.attr('transform', (d: any) => {
          return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')';
        });
        // circle.attr('r', function(d) {
        //   return d.r * k;
        // });
      };
    }
  };

  return <svg ref={gRef} />;
};

export default CirclePack;
