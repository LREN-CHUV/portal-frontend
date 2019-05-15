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

const breadcrumb = (variable: HierarchyCircularNode, paths: HierarchyCircularNode[] = []): HierarchyCircularNode[] =>
  variable && variable.parent ? breadcrumb(variable.parent, [...paths, variable]) : [...paths, variable];

export default (props: Props) => {
  // console.log('Histograms');
  const divRef = useRef(null);
  const { handleSelectedNode, histograms, selectedNode, zoom } = props;

  renderLifeCycle({
    firstRender: () => {
      if (selectedNode) {
        d3.select(divRef.current)
          .selectAll('.shortcut')
          .data(breadcrumb(selectedNode).reverse())
          .join('a')
          // .style('fill-opacity', d => (d.parent === root ? 1 : 0))
          // .style('display', d => (d.parent === root ? 'inline' : 'none'))
          .text(d => d.data.label)
          .on('click', d => {
            handleSelectedNode(d);
            d3.event.stopPropagation();
            zoom(d);
          });
      }
    },
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
            console.log(d3.event);
            handleSelectedNode(d);
            d3.event.stopPropagation();
            zoom(d);
          });
      }
    }
  });

  return (
    <div>
      {selectedNode && (
        <>
          <div>
            <b>Path</b>:
            <div className='d3-link-hierarchy' ref={divRef} />
          </div>
          <p>
            <b>Type</b>: {selectedNode.data.type || 'group'}
          </p>
          <p>
            <b>Description</b>: {selectedNode.data.description || '-'}
          </p>
        </>
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
              <Tab eventKey={i} title={`${h.label.replace('Histogram - ', '')}`} key={i}>
                <Highchart options={h} />
              </Tab>
            ))}
        </Tabs>
      )}
    </div>
  );
};
