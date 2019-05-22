import * as React from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';

import { Node, State } from '../../API/Experiment';
import { MIME_TYPES } from '../../constants';
import { Highchart, HTML, JSON, JSONData, PFA, PlotlyPCA, VISEvilJS } from '../../UI/Visualization';

export default ({ experimentState }: { experimentState: State }) => {
  // const json = require('./__mocks__/responses/fed-woken-knn-2.json');
  // const experiment = APIAdapter.parse(json);
  const experiment = experimentState && experimentState.experiment;
  const nodes = experiment && experiment.results;
  const error = (experimentState && experimentState.error) || (experiment && experiment.error);

  const loading = !nodes && !error;

  const methodsDisplay = (thenode: Node) => (
    <Tabs defaultActiveKey={0} id='tabs-methods'>
      {thenode.methods &&
        thenode.methods.map((method: any, j: number) => (
          <Tab eventKey={j} title={method.algorithm} key={j}>
            {method.mime === MIME_TYPES.ERROR && (
              <div className='error'>
                <h3>An error has occured</h3>
                <p>{method.error}</p>
              </div>
            )}
            {method.mime === MIME_TYPES.JSON && method.data.map((row: any, k: number) => <JSON key={k} row={row} />)}
            {method.mime === MIME_TYPES.PLOTLY &&
              method.data.map((d: { data: any; layout: any }, k: number) => (
                <PlotlyPCA data={d.data} layout={d.layout} key={k} />
              ))}
            {method.mime === MIME_TYPES.VISJS &&
              method.data.map((d: any, k: number) => <VISEvilJS jsString={d} key={k} />)}
            {method.mime === MIME_TYPES.HIGHCHARTS &&
              method.data.map((d: { data: any }, k: number) => <Highchart options={d} key={k} />)}
            {method.mime === MIME_TYPES.PFA &&
              method.data.map((data: any, k: number) => <PFA key={k} method={method} data={data} />)}
            {method.mime === MIME_TYPES.JSONDATA &&
              method.data.map((row: any, k: number) => <JSONData key={k} row={row} />)}
            {method.mime === MIME_TYPES.HTML && method.data.map((doc: any, k: number) => <HTML doc={doc} key={k} />)}
          </Tab>
        ))}
    </Tabs>
  );

  const nodesDisplay = (thenodes: Node[]) => (
    <Tabs defaultActiveKey={0} id='tabs-node'>
      {thenodes &&
        thenodes.map((node: any, i: number) => (
          <Tab eventKey={i} title={node.name} key={i}>
            {methodsDisplay(node)}
          </Tab>
        ))}
    </Tabs>
  );

  return (
    <Panel>
      <Panel.Title>
        <h3>Your Experiment</h3>
      </Panel.Title>
      <Panel.Body>
        {loading ? (
          <div className='loading'>
            <h3>Your experiment is currently running...</h3>
            <p>
              Please check back in a few minutes. This page will automatically refresh once your experiment has finished
              executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className='error'>
            <h3>An error has occured</h3>
            <p>{error}</p>
          </div>
        ) : null}
        {nodes && nodes.length > 1 && nodesDisplay(nodes)}
        {nodes && nodes.length === 1 && methodsDisplay(nodes[0])}
      </Panel.Body>
    </Panel>
  );
};
