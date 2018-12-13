import { APIMining } from "@app/components/API";
import { Alert } from "@app/components/UI/Alert";
import { MIP } from "@app/types";
import * as React from "react";
import { Panel, Tab, Tabs } from "react-bootstrap";
import Table from "./Table";

interface IProps {
  apiMining?: APIMining;
  selectedDatasets?: MIP.API.IVariableEntity[];
}

const Content = ({ apiMining, selectedDatasets }: IProps) =>
  (apiMining && (
    <Panel>
      <Panel.Title>
        <h3>Model Analysis</h3>
      </Panel.Title>
      <Panel.Body>
        {apiMining && apiMining.state && apiMining.state.error && (
          <Alert
            message={apiMining.state && apiMining.state.error}
            title={"Error"}
            style={"info"}
          />
        )}
        {/* {apiMining && apiMining.loaded ? ( */}
        <Tabs defaultActiveKey={1} id="uncontrolled-review-model-tab">
          <Tab eventKey={1} title="Table">
            <Table
              minings={apiMining.state && apiMining.state.minings}
              selectedDatasets={selectedDatasets}
            />
          </Tab>
          <Tab eventKey={2} title="Boxplot">
            Boxplot
          </Tab>
          <Tab eventKey={3} title="Heatmap">
            Heatmap
          </Tab>
        </Tabs>
        {/* ) : (
          "Loading"
        )} */}
      </Panel.Body>
    </Panel>
  )) ||
  null;

export default Content;
