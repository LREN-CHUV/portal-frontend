import * as d3 from 'd3';
import React, { useRef } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { MiningResponseShape } from '../API/Mining';
import Highchart from '../Experiment/Result/formats/Highchart';
import Loading from '../UI/Loader';
import { HierarchyCircularNode } from './Container';
import { renderLifeCycle } from './renderLifeCycle';

interface Props {
  handleSelectedNode: (node: HierarchyCircularNode) => void;
  histograms: MiningResponseShape;
  selectedNode?: HierarchyCircularNode;
  zoom: Function;
}

const breadcrumb = (
  variable: HierarchyCircularNode,
  paths: HierarchyCircularNode[] = []
): HierarchyCircularNode[] =>
  variable && variable.parent
    ? breadcrumb(variable.parent, [...paths, variable])
    : [...paths, variable];

export default (props: Props) => {
  const divRef = useRef(null);
  const childrenRef = useRef(null);
  const { handleSelectedNode, histograms, selectedNode, zoom } = props;

  renderLifeCycle({
    updateRender: () => {
      if (selectedNode) {
        d3.select(divRef.current)
          .selectAll('a')
          .remove();

        d3.select(divRef.current)
          .selectAll('a')
          .data(breadcrumb(selectedNode).reverse())
          .enter()
          .append('a')
          .text(d => d.data.label)
          .on('click', d => {
            handleSelectedNode(d);
            d3.event.stopPropagation();
            zoom(d);
          });

        d3.select(childrenRef.current)
          .selectAll('a')
          .remove();

        d3.select(childrenRef.current)
          .selectAll('a')
          .data(
            selectedNode
              .descendants()
              .filter(d => d.parent === selectedNode && !d.data.isVariable)
          )
          .join('a')
          .text(d => d.data.label)
          .on('click', d => {
            handleSelectedNode(d);
            d3.event.stopPropagation();
            zoom(d);
          });
      }
    }
  });

  const overview = (node: HierarchyCircularNode): any => {
    const children = node
      .descendants()
      .filter(d => d.parent === selectedNode);

    return {
      chart: {
        type: 'column'
      },
      legend: {
        enabled: false
      },
      series: [
        {
          data: children.map(c => c.descendants().length),
          dataLabels: {
            enabled: true
          }
        }
      ],
      title: {
        text: 'Variables contained in subgroups'
      },
      tooltip: {
        enabled: false
      },
      xAxis: {
        categories: children.map(d => d.data.label)
      },
      yAxis: {
        allowDecimals: false
      }
    };
  };

  return (
    <div>
      {selectedNode && (
        <div className={'overview'}>
          <p>
            <b>Path</b>: <span className='d3-link-hierarchy' ref={divRef} />
          </p>
          <p>
            <b>Subgroubs:</b>{' '}
            <span className='d3-link-children' ref={childrenRef} />
          </p>
          <p>
            <b>Type</b>: {selectedNode.data.type || 'group'}
          </p>
          <p>
            <b>Description</b>: {selectedNode.data.description || '-'}
          </p>
        </div>
      )}

      {selectedNode && !selectedNode.data.isVariable && (
        <Highchart options={overview(selectedNode)} />
      )}
      {histograms && histograms.loading && <Loading />}
      {histograms && histograms.error && (
        <div className='error'>
          <h3>An error has occured</h3>
          <p>{histograms.error}</p>
        </div>
      )}
      {histograms && histograms.data && (
        <Tabs defaultActiveKey={0} id='uncontrolled-histogram-tabs'>
          {histograms.data &&
            histograms.data.map((h: any, i: number) => (
              <Tab
                eventKey={i}
                title={`${h.label.replace('Histogram - ', '')}`}
                key={i}>
                <Highchart options={h} />
              </Tab>
            ))}
        </Tabs>
      )}
    </div>
  );
};
