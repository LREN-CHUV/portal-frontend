import './CirclePack.css';

import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import { HierarchyCircularNode, Model } from './Container';
import { HierarchyNode, VariableDatum } from './d3Hierarchy';
import { renderLifeCycle } from './renderLifeCycle';
import Shortcuts from './Shortcuts';

const diameter: number = 800;
const padding: number = 1.5;

interface Props {
  hierarchy: HierarchyNode;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  model: Model;
  selectedNode: HierarchyCircularNode | undefined;
}

interface NodeSelection
  extends d3.Selection<
    Element | d3.EnterElement | Document | Window | SVGCircleElement | null,
    HierarchyCircularNode,
    SVGGElement,
    {}
  > {}

type IView = [number, number, number];

export default (props: Props) => {
  const svgRef = useRef(null);
  let view: [number, number, number];
  let focus: HierarchyCircularNode;

  const { hierarchy, handleSelectNode, model, selectedNode } = props;
  // const [selected, setSelected] = useState<HierarchyCircularNode | undefined>();

  const depth = (n: HierarchyNode): number => (n.children ? 1 + (d3.max<number>(n.children.map(depth)) || 0) : 1);

  const color = d3
    .scaleLinear<string, string>()
    .domain([0, depth(hierarchy)])
    .range(['hsl(190,80%,80%)', 'hsl(228,80%,40%)'])
    .interpolate(d3.interpolateHcl);

  const bubbleLayout = d3
    .pack<VariableDatum>()
    .size([diameter, diameter])
    .padding(padding);

  const layout = bubbleLayout(hierarchy);

  const zoomTo = (v: IView) => {
    const k = diameter / v[2];
    view = v;

    const svg = d3.select(svgRef.current);
    const node = svg.selectAll('circle');
    const label = svg.selectAll('text');

    label.attr('transform', (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('transform', (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('r', (d: any) => d.r * k);
  };

  const zoom = (circleNode: HierarchyCircularNode | undefined) => {
    if (!circleNode) {
      return;
    }

    focus = circleNode;

    // reduce zoom if it's a leaf node
    const targetView: IView = circleNode.children
      ? [focus.x, focus.y, focus.r * 2 + padding]
      : [focus.x, focus.y, focus.r * 3 + padding];
    const transition = d3
      .transition<d3.BaseType>()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween('zoom', () => {
        const i = d3.interpolateZoom(view, targetView);

        return (t: number) => zoomTo(i(t));
      });

    const shouldDisplay = (dd: HierarchyCircularNode, ffocus: HierarchyCircularNode): boolean =>
      dd.parent === ffocus || !ffocus.children; // || !dd.children;

    const svg = d3.select(svgRef.current);
    const node = svg.selectAll('circle');
    const label = svg.selectAll('text');

    node
      .transition()
      .duration(250)
      .style('fill', (d: any) => (d.children ? color(d.depth) : 'white'));

    node
      .filter((d: any) => d !== layout && d.data.code === circleNode.data.code)
      .transition()
      .duration(250)
      .style('fill', '#8C9AA2');

    label
      .filter(function(dd: any) {
        const el = this as HTMLElement;
        return shouldDisplay(dd, focus) || (el && el.style && el.style.display === 'inline');
      })
      .transition(transition as any)
      .style('fill-opacity', (dd: any) => (shouldDisplay(dd, focus) ? 1 : 0))
      .on('start', function(dd: any) {
        const el = this as HTMLElement;
        if (shouldDisplay(dd, focus)) {
          el.style.display = 'inline';
          shouldDisplay(dd, focus);
        }
      });
  };

  renderLifeCycle({
    firstRender: () => {
      const svg = d3
        .select(svgRef.current)
        .attr('width', diameter)
        .attr('height', diameter)
        .attr('viewBox', `-${diameter / 2} -${diameter / 2} ${diameter} ${diameter}`)
        .style('margin', '0 -8px')
        .style('width', 'calc(100% + 16px)')
        .style('height', 'auto')
        .style('cursor', 'pointer')
        .on('click', () => zoom(layout));

      svg
        .append('g')
        .selectAll('circle')
        .data(layout.descendants())
        .join('circle')
        .attr('class', 'node')
        .attr('fill', d => (d.children ? color(d.depth) : 'white'))
        .on('click', d => {
          handleSelectNode(d);
          d3.event.stopPropagation();

          return focus !== d && zoom(d);
        });

      svg
        .selectAll('circle')
        .data(layout.descendants())
        .append('title')
        .text(d => `${d.data.label}\n${d.data.description ? d.data.description : ''}`);

      const maxLength = 12;
      svg
        .append('g')
        .selectAll('text')
        .data(layout.descendants())
        .join('text')
        .attr('class', 'label')
        .style('fill-opacity', d => (d.parent === layout ? 1 : 0))
        .style('display', d => (d.parent === layout ? 'inline' : 'none'))
        .text(d =>
          d.data.label.length > maxLength
            ? d.data.label
                .split(' ')
                .reduce((acc: string, p: string) => (acc.length < maxLength ? `${acc} ${p}` : `${acc}`), '') + '...'
            : d.data.label
        );

      focus = layout;
      zoomTo([layout.x, layout.y, layout.r * 2]);
    }
  });

  return (
    <div>
      <h6>Shortcuts</h6>
      <Shortcuts hierarchy={hierarchy} zoom={zoom}/>
      <svg ref={svgRef} />
    </div>
  );
};
