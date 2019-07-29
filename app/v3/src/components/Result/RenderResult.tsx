import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { Node } from '../API/Experiment';
import { MIME_TYPES } from '../constants';
import {
  Highchart,
  HTML,
  JSON as JSONDoc,
  JSONData,
  PFA,
  PlotlyPCA,
  VISEvilJS
} from '../UI/Visualization';

export default ({ nodes }: { nodes: Node[] | undefined }) => {
  const renderAlgorithm = (thenode: Node) => (
    <Tabs defaultActiveKey={0} id='tabs-methods'>
      {thenode.algorithms &&
        thenode.algorithms.map((algorithm: any, j: number) => (
          <Tab eventKey={j} title={algorithm.algorithm} key={j}>
            {algorithm.mime === MIME_TYPES.ERROR && (
              <div className='error'>
                <h3>An error has occured</h3>
                <p>{algorithm.error}</p>
              </div>
            )}
            {/* {console.log(algorithm)} */}
            {algorithm.mime === MIME_TYPES.JSON &&
              algorithm.data.map((row: any, k: number) => (
                <JSONDoc key={k} row={row} />
              ))}
            {algorithm.mime === MIME_TYPES.PLOTLY &&
              algorithm.data.map((d: { data: any; layout: any }, k: number) => (
                <PlotlyPCA data={d.data} layout={d.layout} key={k} />
              ))}
            {algorithm.mime === MIME_TYPES.VISJS &&
              algorithm.data.map((d: any, k: number) => (
                <VISEvilJS jsString={d} key={k} />
              ))}
            {algorithm.mime === MIME_TYPES.HIGHCHARTS &&
              algorithm.data.map((d: { data: any }, k: number) => (
                <Highchart options={d} key={k} />
              ))}
            {algorithm.mime === MIME_TYPES.PFA &&
              algorithm.data.map((data: any, k: number) => (
                <PFA key={k} method={algorithm} data={data} />
              ))}
            {algorithm.mime === MIME_TYPES.JSONDATA &&
              algorithm.data.map((row: any, k: number) => (
                <JSONData key={k} row={row} />
              ))}
            {algorithm.mime === MIME_TYPES.HTML &&
              algorithm.data.map((doc: any, k: number) => (
                <HTML doc={doc} key={k} />
              ))}
            {algorithm.mime === MIME_TYPES.HTML &&
              algorithm.data.map((doc: any, k: number) => (
                <HTML doc={doc} key={k} />
              ))}
            {algorithm.mime === MIME_TYPES.JSONRAW &&
              algorithm.data.map((doc: object, k: number) => (
                <pre key={k}>{JSON.stringify(doc, null, 4)}</pre>
              ))}
          </Tab>
        ))}
    </Tabs>
  );

  const renderNodes = (thenodes: Node[]) => (
    <Tabs defaultActiveKey={0} id='tabs-node'>
      {thenodes &&
        thenodes.map((node: any, i: number) => (
          <Tab eventKey={i} title={node.name} key={i}>
            {renderAlgorithm(node)}
          </Tab>
        ))}
    </Tabs>
  );

  return (
    <>
      {nodes && nodes.length > 1 && renderNodes(nodes)}
      {nodes && nodes.length === 1 && renderAlgorithm(nodes[0])}
    </>
  );
};
