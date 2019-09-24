import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import { Alert } from '../UI/Alert';
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
}: Props): JSX.Element => (
  <>
    {apiMining && (
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
              <Table
                minings={apiMining.state.summaryStatistics}
                selectedDatasets={selectedDatasets}
                query={model && model.query}
                lookup={lookup}
              />
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    )}
  </>
);
export default Content;
