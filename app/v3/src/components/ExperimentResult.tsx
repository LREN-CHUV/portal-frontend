// tslint:disable:no-console
import { IExperimentContainer, INode } from "@app/types";
import * as React from "react";
import { Panel, Tab, Tabs } from "react-bootstrap";
import { MIME_TYPES } from "../constants";
import { Highchart, Plotly } from "./Experiment/";

export default ({
  experimentState
}: {
  experimentState: IExperimentContainer;
}) => {
  const experiment = experimentState && experimentState.experiment;
  const nodes = experiment && experiment.nodes;
  const error =
    (experimentState && experimentState.error) ||
    (experiment && experiment.error);

  const loading = !nodes && !error;

  const methodsDisplay = (thenode: INode) => (
    <Tabs defaultActiveKey={0} id="tabs-methods">
      {thenode.methods &&
        thenode.methods.map((m: any, j: number) => (
          <Tab eventKey={j} title={m.algorithm} key={j}>
            {m.mime === MIME_TYPES.ERROR && (
              <div>
                <h3>An error has occured</h3>
                <p>{m.error}</p>
              </div>
            )}
            {m.mime === MIME_TYPES.JSON &&
              m.data.map((d: any, k: number) => (
                <pre key={k}>{JSON.stringify(d, null, 2)}</pre>
              ))}
            {m.mime === MIME_TYPES.PLOTLY &&
              m.data.map((d: { data: any; layout: any }, k: number) => (
                <Plotly data={d.data} layout={d.layout} key={k} />
              ))}
            {m.mime === MIME_TYPES.HIGHCHARTS &&
              m.data.map((d: { data: any }, k: number) => (
                <Highchart options={d} key={k} />
              ))}

            {m.mime === MIME_TYPES.PFA &&
              m.data.map((d: any, k: number) => (
                <pre key={k}>{JSON.stringify(d, null, 2)}</pre>
              ))}
          </Tab>
        ))}
    </Tabs>
  );

  const nodesDisplay = (thenodes: INode[]) => (
    <Tabs defaultActiveKey={0} id="tabs-node">
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
        <h3>Results</h3>
      </Panel.Title>
      <Panel.Body>
        {loading ? (
          <div>
            <h3>Your experiment is currently running...</h3>
            <p>
              Please check back in a few minutes. This page will automatically
              refresh once your experiment has finished executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div>
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
