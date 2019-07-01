import * as d3 from 'd3';
import React, { useRef } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { MiningResponseShape } from '../API/Mining';
import Loading from '../UI/Loader';
import Highchart from '../UI/Visualization/Highchart';
import { HierarchyCircularNode } from './Container';
import renderLifeCycle from './renderLifeCycle';

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
      }
    }
  });

  const overviewChart = (node: HierarchyCircularNode): any => {
    let children = node
      .descendants()
      .filter(d => d.parent === selectedNode && !d.data.isVariable);

    children = children.length ? children : [node];
    return {
      chart: {
        type: 'column'
      },
      legend: {
        enabled: false
      },
      series: [
        {
          data: children.map(c => c.descendants().length - 1),
          dataLabels: {
            enabled: true
          }
        }
      ],
      title: {
        text: `Variables contained in ${node.data.label}`
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
            <b>Type</b>: {selectedNode.data.type || 'group'}
          </p>
          <p>
            <b>Description</b>: {selectedNode.data.description || '-'}
          </p>
        </div>
      )}

      <div className={'histograms'}>
        {selectedNode && selectedNode.children && (
          <Highchart options={overviewChart(selectedNode)} />
        )}
        {histograms && histograms.loading && <Loading />}
        {histograms && histograms.error && (
          <div className='error'>
            <h3>An error has occured</h3>
            <p>{histograms.error}</p>
          </div>
        )}

        {selectedNode &&
          !selectedNode.children && histograms && histograms.data && (
          <Tabs defaultActiveKey={0} id='uncontrolled-histogram-tabs'>
            {histograms.data &&
              histograms.data.map((d: any, i: number) => (
                <Tab
                  eventKey={i}
                  title={`${d.label.replace('Histogram - ', '')}`}
                  key={i}>
                  <Highchart options={d.highchart || d} />
                </Tab>
              ))}
          </Tabs>
        )}

        {/* {selectedNode &&
          !selectedNode.children &&
          histograms &&
          histograms.data && (
            <Tabs defaultActiveKey={0} id='uncontrolled-histogram-tabs'>
              {histograms.data &&
                histograms.data.map((d: any, i: number) => (
                  <Tab
                    eventKey={i}
                    title={`${d.label && d.label.toUpperCase()}`}
                    key={i}>
                    {console.log(d.highchart)}
                    <Highchart options={d.highchart} />
                  </Tab>
                ))}
            </Tabs>
          )} */}
      </div>
    </div>
  );
};
