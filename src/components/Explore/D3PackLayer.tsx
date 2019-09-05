import './CirclePack.css';

import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef } from 'react';

import { APICore, APIModel } from '../API';
import { Pathology, VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import { D3Model, HierarchyCircularNode } from './Container';
import Explore from './Explore';

const diameter: number = 800;
const padding: number = 1.5;

type IView = [number, number, number];

const depth = (n: HierarchyCircularNode): number =>
  n.children ? 1 + (d3.max<number>(n.children.map(depth)) || 0) : 1;

export interface Props {
  apiCore: APICore;
  apiModel: APIModel;
  datasets?: VariableEntity[];
  selectedDatasets: VariableEntity[];
  selectedPathology: string;
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectPathology: (code: Pathology) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleUpdateD3Model: Function; // (type: ModelType, node?: HierarchyCircularNode) => void;
  handleSelectModel: (d3Model?: ModelResponse) => void;
  handleGoToAnalysis: Function;
}

export default ({ layout, ...props }: Props) => {
  const svgRef = useRef(null);
  const view = useRef<IView>([diameter / 2, diameter / 2, diameter]);
  const focus = useRef(layout);
  const { d3Model, selectedNode } = props;

  const color = d3
    .scaleLinear<string, string>()
    .domain([0, depth(layout)])
    .range(['hsl(190,80%,80%)', 'hsl(228,80%,40%)'])
    .interpolate(d3.interpolateHcl);

  const zoomTo = (v: IView) => {
    const k = diameter / v[2];
    view.current = v;

    const svg = d3.select(svgRef.current);
    const node = svg.selectAll('circle');
    const label = svg.selectAll('text');

    label.attr(
      'transform',
      (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr(
      'transform',
      (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr('r', (d: any) => d.r * k);
  };

  const zoom = (circleNode: HierarchyCircularNode | undefined) => {
    if (!circleNode) {
      return;
    }

    focus.current = circleNode;

    // reduce zoom if it's a leaf node
    const zoomFactor = circleNode.children ? 2 : 3;
    const targetView: IView = [
      circleNode.x,
      circleNode.y,
      circleNode.r * zoomFactor + padding
    ];
    const transition = d3
      .transition<d3.BaseType>()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween('zoom', () => {
        const i = d3.interpolateZoom(view.current, targetView);

        return (t: number) => zoomTo(i(t));
      });

    const shouldDisplay = (
      dd: HierarchyCircularNode,
      ffocus: HierarchyCircularNode
    ): boolean => dd.parent === ffocus || !ffocus.children; // || !dd.children;

    const svg = d3.select(svgRef.current);
    const text = svg.selectAll('text');

    text
      .filter(function(dd: any) {
        const el = this as HTMLElement;
        return (
          shouldDisplay(dd, focus.current) ||
          (el && el.style && el.style.display === 'inline')
        );
      })
      .transition(transition as any)
      .style('fill-opacity', (dd: any) =>
        shouldDisplay(dd, focus.current) ? 1 : 0
      )
      .on('start', function(dd: any) {
        const el = this as HTMLElement;
        if (shouldDisplay(dd, focus.current)) {
          el.style.display = 'inline';
          shouldDisplay(dd, focus.current);
        }
      });
  };

  const colorCallback = useCallback(color, [layout]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const circle = svg.selectAll('circle');
    circle
      .style('fill-opacity', '1')
      .filter(
        (d: any) =>
          ![
            d3Model.variable,
            ...(d3Model.covariables || []),
            ...(d3Model.filters || [])
          ].includes(d)
      )
      .style('fill', (d: any) =>
        d.children ? colorCallback(d.depth) : 'white'
      );

    if (selectedNode && selectedNode !== layout) {
      circle
        .filter((d: any) => d.data.code === selectedNode.data.code)
        .transition()
        .duration(80)
        .style('fill-opacity', '0.8');
    }

    if (d3Model.filters && d3Model.filters.length > 0) {
      circle
        .filter(
          (d: any) =>
            d3Model.filters !== undefined && d3Model.filters.includes(d)
        )
        .transition()
        .duration(250)
        .style('fill', '#337ab7');
    }
    if (d3Model.variable) {
      circle
        .filter((d: any) => d3Model.variable === d)
        .transition()
        .duration(250)
        .style('fill', '#5cb85c');
    }

    if (d3Model.covariables && d3Model.covariables.length > 0) {
      circle
        .filter(
          (d: any) =>
            d3Model.covariables !== undefined && d3Model.covariables.includes(d)
        )
        .transition()
        .duration(250)
        .style('fill', '#f0ad4e');
    }
  }, [d3Model, colorCallback, selectedNode, layout]);

  const zoomCallback = useCallback(zoom, []);
  const selectNodeCallback = useCallback(props.handleSelectNode, []);

  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll('g')
      .remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', diameter)
      .attr('height', diameter)
      .attr(
        'viewBox',
        `-${diameter / 2} -${diameter / 2} ${diameter} ${diameter}`
      )
      .style('margin', '0')
      .style('width', 'calc(100%)')
      .style('height', 'auto')
      .style('cursor', 'pointer')
      .style('border-radius', '4px')
      .on('click', () => zoomCallback(layout));

    svg
      .append('g')
      .selectAll('circle')
      .data(layout.descendants())
      .join('circle')
      .attr('class', 'node')
      .attr('fill', d => (d.children ? colorCallback(d.depth) : 'white'))
      .on('click', d => {
        selectNodeCallback(d);
        d3.event.stopPropagation();
        // Don't zoom on single variable selection
        if (!d.children) {
          return;
        }

        return focus.current !== d && zoomCallback(d);
      });

    svg
      .selectAll('circle')
      .data(layout.descendants())
      .append('title')
      .text(
        d => `${d.data.label}\n${d.data.description ? d.data.description : ''}`
      );

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
              .reduce(
                (acc: string, p: string) =>
                  acc.length < maxLength ? `${acc} ${p}` : `${acc}`,
                ''
              ) + '...'
          : d.data.label
      );

    selectNodeCallback(layout);
    zoomTo([layout.x, layout.y, layout.r * 2]);
  }, [layout, colorCallback, selectNodeCallback, zoomCallback]);

  return (
    <Explore layout={layout} zoom={zoom} {...props}>
      <svg ref={svgRef} />
    </Explore>
  );
};
