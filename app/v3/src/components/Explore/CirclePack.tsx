import './CirclePack.css';

import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

import { MIP } from '../../types';

interface IProps {
  hierarchy: MIP.Internal.IVariableDatum;
  handleSelectVariable: (node: d3.HierarchyNode<MIP.Internal.IVariableDatum>) => void;
}

export default ({ hierarchy, handleSelectVariable }: IProps) => {
  const gRef = useRef<SVGSVGElement>(null);
  const diameter: number = 800;
  const padding: number = 1.5;

  useEffect(() => {
    if (hierarchy) {
      d3Render();
    }
  }, [hierarchy]);

  const depth = (node: d3.HierarchyNode<MIP.Internal.IVariableDatum>): number =>
    node.children ? 1 + (d3.max<number>(node.children.map(depth)) || 0) : 1;

  const d3Render = () => {
    const svgRef = gRef.current;
    let view: [number, number, number];
    let focus: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>;
    let node: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>, SVGGElement, {}>
    let label: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>, SVGGElement, {}>

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

      const zoom = (d: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>) => {
        handleSelectVariable(d);
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

            return (t: number) => zoomTo(i(t));
          });

        const shouldDisplay = (dd: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>, ffocus: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>) : boolean => dd.parent === ffocus; // || !dd.children;

        label
          .filter(function(dd) {
            const el = this as HTMLElement;
            return (
              shouldDisplay(dd, focus) ||
              (el && el.style && el.style.display === 'inline')
            );
          })
          .transition(transition as any)
          .style('fill-opacity', dd => (shouldDisplay(dd, focus) ? 1 : 0))
          .on('start', function(dd) {
            const el = this as HTMLElement;
            if (shouldDisplay(dd, focus)) {
              el.style.display = 'inline';
              shouldDisplay(dd, focus);
            }
          })
          .on('end', function(dd) {
            if (dd.parent !== focus) {
              const el = this as HTMLElement;
              el.style.display = 'none';
            }
          });
      };

      // Layout
      const bubbleLayout = d3
        .pack<MIP.Internal.IVariableDatum>()
        .size([diameter, diameter])
        .padding(padding);

      const data = d3
        .hierarchy(hierarchy)
        .sum(d => (d.label ? d.label.length : 1))
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

      node = svg
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
          d =>
            `${d.data.label}\n${d.data.description ? d.data.description : ''}`
        );

      label = svg
        .append('g')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .attr('class', 'label')
        .style('fill-opacity', d => (d.parent === root ? 1 : 0))
        .style('display', d => (d.parent === root ? 'inline' : 'none'))
        .text(d => d.data.label);

      focus = root;
      zoomTo([root.x, root.y, root.r * 2]);
    }
  };

  return <svg ref={gRef} />;
};
