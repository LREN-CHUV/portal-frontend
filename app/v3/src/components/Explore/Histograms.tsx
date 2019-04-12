import * as d3 from 'd3';
import React, { useRef } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { MIP } from '../../types';
import Highchart from '../Experiment/Result/formats/Highchart';
import Loading from '../UI/Loader';
import { IVariableNode } from './Container';

export default ({
  handleSelectVariable,
  histograms,
  selectedVariable
}: {
  handleSelectVariable: (
    node: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>
  ) => void;
  histograms: MIP.Store.IMiningResponseShape;
  selectedVariable: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum> | undefined;
}) => {
  const dRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = dRef.current;

  const breadcrumb = (
    variable: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>,
    paths: Array<d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>> = []
  ): Array<d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>> =>
    variable && variable.parent
      ? breadcrumb(variable.parent, [...paths, variable])
      : paths;

  if (selectedVariable) {
    d3.select(shortcutsRef)
      .selectAll('.shortcut')
      .data(breadcrumb(selectedVariable).reverse())
      .join('a')
      // .style('fill-opacity', d => (d.parent === root ? 1 : 0))
      // .style('display', d => (d.parent === root ? 'inline' : 'none'))
      .text(d => d.data.label)
      .on('click', d => {
        console.log(d3.event)
        handleSelectVariable(d)
        //   zoom(d);
      });
  }
  return (
    <div>
      {selectedVariable && (
        <div>
          <div ref={dRef} />
          <p>
            <b>Name</b>: {selectedVariable.data.label}
          </p>
          <p>
            <b>Type</b>: {selectedVariable.data.type}
          </p>
          <p>
            <b>Description</b>: {selectedVariable.data.description}
          </p>
        </div>
      )}
      {histograms && histograms.loading && <Loading />}
      {histograms && histograms.error && (
        <div className='error'>
          <h3>An error has occured</h3>
          <p>{histograms.error}</p>
        </div>
      )}
      {histograms && histograms.data && (
        <Tabs defaultActiveKey={1} id='uncontrolled-histogram-tabs'>
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
