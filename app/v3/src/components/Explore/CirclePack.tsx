import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface IProps {
  hierarchy: any;
}
export default ({ hierarchy }: IProps) => {
  const gRef = useRef<SVGSVGElement>(null);
  const diameter = 800;
  const padding = 1.5;

  useEffect(() => {
    if (hierarchy) {
      d3Render();
    }
  }, [hierarchy]);

  const depth = (node: any): number =>
    node.children ? 1 + (d3.max<number>(node.children.map(depth)) || 0) : 1;

  const d3Render = () => {
    const svgRef = gRef.current;
    let view: [number, number, number];
    let focus: any;

    if (svgRef) {
      // interactive functions
      const zoomTo = (v: [number, number, number]) => {
        const k = diameter / v[2];
        view = v;

        label.attr(
          'transform',
          d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr(
          'transform',
          d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr('r', d => d.r * k);
      };

      const zoom = (d: any) => {
        focus = d;
        const transition = d3
          .transition<d3.BaseType>()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween('zoom', () => {
            const i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + padding
            ]);

            return (t: any) => zoomTo(i(t));
          });

        label
          .filter(function(dd: any) {
            const el = this as HTMLElement;
            return (
              dd.parent === focus ||
              (el && el.style && el.style.display === 'inline')
            );
          })
          .transition(transition as any)
          .style('fill-opacity', (dd: any) => (dd.parent === focus ? 1 : 0))
          .on('start', function(dd: any) {
            const el = this as HTMLElement;
            if (dd.parent === focus) {
              el.style.display = 'inline';
            }
          })
          .on('end', function(dd: any) {
            if (dd.parent !== focus) {
              const el = this as HTMLElement;
              el.style.display = 'none';
            }
          });
      };

      // Layout
      const bubbleLayout = d3
        .pack()
        .size([diameter, diameter])
        .padding(padding);

      const data = d3
        .hierarchy(hierarchy)
        .sum(d => {
          return d.name ? d.name.length : 1;
        })
        .sort((a, b) => (a < b ? -1 : 1));

      const root = bubbleLayout(data);

      const color = d3
        .scaleLinear<string, string>()
        .domain([0, depth(data)])
        .range(['hsl(190,80%,80%)', 'hsl(228,80%,40%)'])
        .interpolate(d3.interpolateHcl);

      const svg = d3
        .select(svgRef)
        .attr('width', diameter)
        .attr('height', diameter)
        .attr(
          'viewBox',
          `-${diameter / 2} -${diameter / 2} ${diameter} ${diameter}`
        )
        .style('margin', '0 -8px')
        .style('width', 'calc(100% + 16px)')
        .style('height', 'auto')
        .style('cursor', 'pointer')
        .on('click', () => zoom(root));

      const node = svg
        .append('g')
        .selectAll('circle')
        .data(root.descendants())
        .join('circle')
        .attr('fill', d => (d.children ? color(d.depth) : 'white'))
        .attr('pointer-events', d => (!d.children ? 'none' : null))
        .on('mouseover', function() {
          d3.select(this).attr('stroke', '#000');
        })
        .on('mouseout', function() {
          d3.select(this).attr('stroke', null);
        })
        .on('click', d => focus !== d && (zoom(d), d3.event.stopPropagation()));

      const label = svg
        .append('g')
        .style('font', '16px sans-serif')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .style('fill-opacity', d => (d.parent === root ? 1 : 0))
        .style('display', d => (d.parent === root ? 'inline' : 'none'))
        
        .text((d: any) => d.data.name);

      focus = root;
      zoomTo([root.x, root.y, root.r * 2]);
    }
  };

  return <svg ref={gRef} />;
};
