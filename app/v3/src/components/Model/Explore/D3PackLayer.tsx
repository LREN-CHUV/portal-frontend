import * as d3 from 'd3';
import React, { useRef } from 'react';
import { APIModel } from '../../API';
import { VariableEntity } from '../../API/Core';
import './CirclePack.css';
import { D3Model, HierarchyCircularNode } from './Container';
import Explore from './Explore';
import renderLifeCycle from './renderLifeCycle';

const diameter: number = 800;
const padding: number = 1.5;

type IView = [number, number, number];

const depth = (n: HierarchyCircularNode): number =>
  n.children ? 1 + (d3.max<number>(n.children.map(depth)) || 0) : 1;

export interface Props {
  apiModel: APIModel;
  datasets?: VariableEntity[];
  selectedDatasets: VariableEntity[];
  selectedNode: HierarchyCircularNode | undefined;
  layout: HierarchyCircularNode;
  histograms?: any;
  d3Model: D3Model;
  handleSelectDataset: (e: VariableEntity) => void;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  handleD3ChangeModel: Function; //(type: ModelType, node?: HierarchyCircularNode) => void;
  handleSelectModel: Function;
  handleGoToAnalysis: Function;
}

export default ({ layout, ...props }: Props) => {
  const svgRef = useRef(null);
  const view = useRef<IView>([diameter / 2, diameter / 2, diameter]);
  const focus = useRef(layout);

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

  renderLifeCycle({
    firstRender: () => {
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
        .on('click', () => zoom(layout));

      svg
        .append('g')
        .selectAll('circle')
        .data(layout.descendants())
        .join('circle')
        .attr('class', 'node')
        .attr('fill', d => (d.children ? color(d.depth) : 'white'))
        .on('click', d => {
          props.handleSelectNode(d);
          d3.event.stopPropagation();

          return focus.current !== d && zoom(d);
        });

      svg
        .selectAll('circle')
        .data(layout.descendants())
        .append('title')
        .text(
          d =>
            `${d.data.label}\n${d.data.description ? d.data.description : ''}`
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

      props.handleSelectNode(layout);
      zoomTo([layout.x, layout.y, layout.r * 2]);
    },
    updateRender: () => {
      const model = props.d3Model;
      const svg = d3.select(svgRef.current);
      const circle = svg.selectAll('circle');
      circle
        .filter(
          (d: any) =>
            ![
              model.variable,
              ...(model.covariables || []),
              ...(model.filters || [])
            ].includes(d)
        )
        .style('fill', (d: any) => (d.children ? color(d.depth) : 'white'));

      if (model.variable) {
        circle
          .filter((d: any) => model.variable === d)
          .transition()
          .duration(250)
          .style('fill', '#5cb85c');
      }

      if (model.covariables && model.covariables.length > 0) {
        circle
          .filter(
            (d: any) =>
              model.covariables !== undefined && model.covariables.includes(d)
          )
          .transition()
          .duration(250)
          .style('fill', '#f0ad4e');
      }

      if (model.filters && model.filters.length > 0) {
        circle
          .filter(
            (d: any) => model.filters !== undefined && model.filters.includes(d)
          )
          .transition()
          .duration(250)
          .style('fill', '#337ab7');
      }
    }
  });

  return (
    <div>
      <Explore layout={layout} zoom={zoom} {...props}>
        <svg ref={svgRef} />
      </Explore>
    </div>
  );
};
