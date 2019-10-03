import * as d3 from 'd3';
import React, { useRef } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import styled from 'styled-components';

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

const Histogram = styled.div`
  min-height: 440px;
  margin-top: 8px;
`;

const Overview = styled.div`
  p {
    margin: 0;
  }
`;

const Breadcrumb = styled.span`
  a:after {
    content: ' > ';
  }
  a:last-child:after {
    content: '';
  }
  a:after {
    content: ' | ';
  }
  a:last-child:after {
    content: '';
  }
`;

export default (props: Props): JSX.Element => {
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
    <>
      {selectedNode && (
        <Overview>
          <p>
            <b>Path</b>: <Breadcrumb ref={divRef} />
          </p>
          <p>
            <b>Type</b>: {selectedNode.data.type || 'group'}
          </p>
          <p>
            <b>Description</b>: {selectedNode.data.description || '-'}
          </p>
        </Overview>
      )}

      <Histogram>
        {selectedNode && selectedNode.children && (
          <Highchart options={overviewChart(selectedNode)} />
        )}
        {histograms && histograms.loading && <Loading />}
        {histograms && histograms.error && (
          <div className="error">
            <h3>An error has occured</h3>
            <p>{histograms.error}</p>
          </div>
        )}

        {histograms && histograms.warning && (
          <div className="warning">
            <p>{histograms.warning}</p>
          </div>
        )}

        {selectedNode &&
          !selectedNode.children &&
          histograms &&
          histograms.data && (
            <Tabs defaultActiveKey={0} id="uncontrolled-histogram-tabs">
              {histograms.data &&
                histograms.data.map((d: any, i: number) => (
                  <Tab
                    eventKey={i}
                    title={`${d.label.replace('Histogram - ', '')}`}
                    key={i}
                  >
                    <Highchart
                      options={(d.highchart && d.highchart.data) || d}
                    />
                  </Tab>
                ))}
            </Tabs>
          )}
      </Histogram>
    </>
  );
};
