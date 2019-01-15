import { APIMining } from "@app/components/API";
import { Alert } from "@app/components/UI/Alert";
import { MIP } from "@app/types";
import * as React from "react";
import { Button, Panel, Tab, Tabs } from "react-bootstrap";
import { Body } from "react-bootstrap/lib/Modal";
import Boxplot from "./Boxplot";
import HeatMap from "./HeatMap";
import Table from "./Table";

interface IProps {
  apiMining?: APIMining;
  model?: MIP.API.IModelResponse;
  handleRunAnalysis: () => void;
  selectedDatasets?: MIP.API.IVariableEntity[];
  tableData: any[];
  children: any;
}

const Content = ({
  apiMining,
  model,
  handleRunAnalysis,
  selectedDatasets,
  tableData,
  children
}: IProps) =>
  (apiMining && (
    <Panel>
      <Panel.Body>
        {apiMining && apiMining.state && apiMining.state.error && (
          <Alert
            message={apiMining.state && apiMining.state.error}
            title={"Error"}
            style={"info"}
          />
        )}
        {children}
        <Panel>
          <Panel.Title className="model-analysis-title">
            <h3>Model Analysis</h3>
            <Button bsStyle={"primary"} onClick={handleRunAnalysis}>
              RUN ANALYSIS
            </Button>
          </Panel.Title>
          <Body>
            <Tabs defaultActiveKey={1} id="uncontrolled-review-model-tab">
              <Tab eventKey={1} title="Table">
                <Table
                  minings={apiMining.state.minings}
                  tableData={tableData}
                />
              </Tab>
              <Tab eventKey={2} title="Boxplot">
                <Boxplot
                  miningState={apiMining.state}
                  selectedDatasets={selectedDatasets}
                />
              </Tab>
              <Tab eventKey={3} title="Heatmap">
                <HeatMap apiMining={apiMining} model={model} />
              </Tab>
            </Tabs>
          </Body>
        </Panel>
      </Panel.Body>
    </Panel>
  )) ||
  null;

export default Content;
