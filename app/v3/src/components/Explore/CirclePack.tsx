import './CirclePack.css';

import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import { HierarchyCircularNode, Model } from './Container';
import { VariableDatum, HierarchyNode } from './d3Hierarchy';
interface Props {
  hierarchy?: HierarchyNode;
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

export default ({ hierarchy, handleSelectNode, model, selectedNode }: Props) => {
  const [loaded, setLoaded] = useState(false);
  // const [selected, setSelected] = useState<HierarchyCircularNode | undefined>();
  // const [layout, setLayout] = useState<HierarchyCircularNode>();
  const gRef = useRef<SVGSVGElement>(null);
  const dRef = useRef<HTMLDivElement>(null);
  const svgRef = gRef.current;
  const shortcutsRef = dRef.current;

  const diameter: number = 800;
  const padding: number = 1.5;
  //
  let view: [number, number, number];
  let focus: HierarchyCircularNode;
  let node: NodeSelection;
  let label: NodeSelection;
  let color: d3.ScaleLinear<string, string>;
  let zoom: any;
  let layout: HierarchyCircularNode;

  useEffect(() => {
    if (hierarchy && !loaded) {
      const bubbleLayout = d3
        .pack<VariableDatum>()
        .size([diameter, diameter])
        .padding(padding);
        layout = bubbleLayout(hierarchy);

      setLoaded(true);
      d3Render();
    }

    if (selectedNode) {
      console.log(selectedNode);

      // const targetView = [
      //   selectedNode.x,
      //   selectedNode.y,
      //   selectedNode.r * 2 + padding
      // ];

      // const iview: IView = [selectedNode.x, selectedNode.y, selectedNode.r * 2]

      // d3.transition<d3.BaseType>()
      //   .duration(750)
      //   // .call(zoomTo(iview))
      //   .tween('zoom', () => {
      //     const i = d3.interpolateZoom(view, iview);

      //     return (t: number) => zoomTo(i(t));
      //   });

      // zoomTo([selectedNode.x, selectedNode.y, selectedNode.r * 2]);
      const event = document.createEvent('Event');
      event.initEvent('click', true, true);
      const n = d3.select(svgRef).node();
      if (n) {
        n.dispatchEvent(event);
      }

      zoom(selectedNode);

      // const node = selectedNode.node();
      // selectedNode.dispatchEvent(event);

      // const { x, y } = selectedNode;
      // const t = d3.zoomIdentity
      //   .translate(x, y)
      //   .scale(2);

      // d3.select(svgRef)
      //   .transition()
      //   .duration(250)
      //   .call(zoom, selectedNode);

      // const targetView: IView = selectedNode.children
      //   ? [focus.x, focus.y, focus.r * 2 + padding]
      //   : [focus.x, focus.y, focus.r * 3 + padding];
      // const transition = d3
      //   .transition<d3.BaseType>()
      //   .duration(d3.event.altKey ? 7500 : 750)
      //   .tween('zoom', () => {
      //     const i = d3.interpolateZoom(view, targetView);

      //     return (t: number) => zoomTo(i(t));
      //   });

      // console.log(d3.event)
      // zoom(selectedVariable);
    }
  }, [hierarchy, selectedNode]);

  const depth = (n: HierarchyCircularNode): number =>
    n.children ? 1 + (d3.max<number>(n.children.map(depth)) || 0) : 1;

  // interactive functions
  const zoomTo = (v: IView) => {
    const k = diameter / v[2];
    view = v;

    label.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('r', d => d.r * k);
  };

  zoom = (circleNode: HierarchyCircularNode | undefined) => {
    if (!circleNode) {
      return;
    }

    console.log('zoom called', d3.event);
    // console.log(circleNode.x, circleNode.y, circleNode.r)

    focus = circleNode;

    // reduce zoom if it's a leaf node
    const targetView: IView = circleNode.children
      ? [focus.x, focus.y, focus.r * 2 + padding]
      : [focus.x, focus.y, focus.r * 3 + padding];
    d3.transition<d3.BaseType>()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween('zoom', () => {
        const i = d3.interpolateZoom(view, targetView);

        return (t: number) => zoomTo(i(t));
      });

    // const shouldDisplay = (
    //   dd: HierarchyCircularNode,
    //   ffocus: HierarchyCircularNode
    // ): boolean => dd.parent === ffocus || !ffocus.children; // || !dd.children;

    // Revert all nodes fill color
    // console.log('zoom');
    node
      // .transition()
      // .duration(250)
      .style('fill', d => (d.children ? color(d.depth) : 'white'));

    node
      .filter(d => d !== layout && d.data.code === circleNode.data.code)
      // .transition()
      // .duration(250)
      .style('fill', '#8C9AA2');

    // label
    //   .filter(function(dd) {
    //     const el = this as HTMLElement;
    //     return (
    //       shouldDisplay(dd, focus) ||
    //       (el && el.style && el.style.display === 'inline')
    //     );
    //   })
    //   .transition(transition as any)
    //   .style('fill-opacity', dd => (shouldDisplay(dd, focus) ? 1 : 0))
    //   .on('start', function(dd) {
    //     const el = this as HTMLElement;
    //     if (shouldDisplay(dd, focus)) {
    //       el.style.display = 'inline';
    //       shouldDisplay(dd, focus);
    //     }
    //   });
  };

  const d3Render = () => {
    console.log(layout);
    if (!layout) {
      return;
    }

    if (svgRef && layout) {
      // Layout
      // setRoot(bubbleLayout(hierarchyNode))
      console.log('d3Render');
      color = d3
        .scaleLinear<string, string>()
        .domain([0, depth(layout)])
        .range(['hsl(190,80%,80%)', 'hsl(228,80%,40%)'])
        .interpolate(d3.interpolateHcl);

      const svg = d3
        .select(svgRef)
        .attr('width', diameter)
        .attr('height', diameter)
        .attr('viewBox', `-${diameter / 2} -${diameter / 2} ${diameter} ${diameter}`)
        .style('margin', '0 -8px')
        .style('width', 'calc(100% + 16px)')
        .style('height', 'auto')
        .style('cursor', 'pointer')
        .on('click', () => zoom(layout));

      node = svg
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
      label = svg
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

      d3.select(shortcutsRef)
        .selectAll('.shortcut')
        .data(layout.descendants())
        .join('a')
        .style('fill-opacity', d => (d.parent === layout ? 1 : 0))
        .style('display', d => (d.parent === layout ? 'inline' : 'none'))
        .text(d => d.data.label)
        .on('click', d => {
          zoom(d);
        });
    }
  };

  return (
    <div>
      <h6>Shortcuts</h6>
      <div ref={dRef} />
      <svg ref={gRef} />
    </div>
  );
};
