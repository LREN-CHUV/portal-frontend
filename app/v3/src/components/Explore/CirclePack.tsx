import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import './CirclePack.css';
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

        const shouldDisplay = (dd: any, ffocus: any) =>
          dd.parent === ffocus // || !dd.children;

        label
          .filter(function(dd: any) {
            const el = this as HTMLElement;
            return (
              shouldDisplay(dd, focus) ||
              (el && el.style && el.style.display === 'inline')
            );
          })
          .transition(transition as any)
          .style('fill-opacity', (dd: any) =>
            shouldDisplay(dd, focus) ? 1 : 0
          )
          .on('start', function(dd: any) {
            const el = this as HTMLElement;
            if (shouldDisplay(dd, focus)) {
              el.style.display = 'inline';
              shouldDisplay(dd, focus);
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
        .sum(d => (d.name ? d.name.length : 1))
        .sort((a: any, b: any) => b.value - a.value);

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
        .attr('class', 'node')
        .attr('fill', d => (d.children ? color(d.depth) : 'white'))
        .on('click', d => focus !== d && (zoom(d), d3.event.stopPropagation()));

      svg
        .selectAll('circle')
        .data(root.descendants())
        .append('title')
        .text(
          (d: any) =>
            `${d.data.name}\n${d.data.description ? d.data.description : ''}`
        );

      const label = svg
        .append('g')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .attr('class', 'label')
        .style('fill-opacity', d => (d.parent === root ? 1 : 0))
        .style('display', d => (d.parent === root ? 'inline' : 'none'))
        .text((d: any) => d.data.name);

      focus = root;
      zoomTo([root.x, root.y, root.r * 2]);
    }
  };

  return <svg ref={gRef} />;
};
