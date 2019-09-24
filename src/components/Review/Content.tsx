import * as React from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import { APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import { Alert } from '../UI/Alert';
import Boxplot from './Boxplot';
import Table from './Table';

interface Props {
  apiMining?: APIMining;
  model?: ModelResponse;
  selectedDatasets?: VariableEntity[];
  lookup: (code: string) => VariableEntity;
  children: any;
}

const Content = ({
  apiMining,
  model,
  selectedDatasets,
  lookup,
  children
}: Props) =>
  (apiMining && (
    <Panel>
      <Panel.Body>
        {apiMining && apiMining.state && apiMining.state.error && (
          <Alert
            message={apiMining.state && apiMining.state.error}
            title={'Error'}
            styled={'info'}
          />
        )}
        {children}
        <Panel>
          <Panel.Body>
            {/* <Tabs defaultActiveKey={1} id="uncontrolled-review-model-tab"> */}
            {/* <Tab eventKey={1} title="Table"> */}
            <Table
              minings={apiMining.state.summaryStatistics}
              selectedDatasets={selectedDatasets}
              query={model && model.query}
              lookup={lookup}
            />
            {/* </Tab> */}
            {/* <Tab eventKey={2} title="Boxplot">
                <Boxplot
                  miningState={apiMining.state}
                  selectedDatasets={selectedDatasets}
                />
              </Tab> */}
            {/* </Tabs> */}
          </Panel.Body>
        </Panel>
      </Panel.Body>
    </Panel>
  )) ||
  null;

export default Content;
