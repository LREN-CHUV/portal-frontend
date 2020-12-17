import * as React from 'react';
import { Card } from 'react-bootstrap';

import { APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import { Alert } from '../UI/Alert';
import ResultsErrorBoundary from '../UI/ResultsErrorBoundary';
import Table from './Table';

interface Props {
  apiMining?: APIMining;
  model?: ModelResponse;
  selectedDatasets?: VariableEntity[];
  lookup: (code: string, pathologyCode: string | undefined) => VariableEntity;
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
    {apiMining && apiMining.state && apiMining.state.error && (
      <Alert
        message={apiMining.state && apiMining.state.error}
        title={'Error'}
        styled={'info'}
      />
    )}
    {apiMining && (
      <Card>
        <Card.Body>
          {children}
          <Card>
            <Card.Body>
              {(!selectedDatasets || selectedDatasets.length === 0) && (
                <p>Please, select a dataset</p>
              )}

              {selectedDatasets &&
                selectedDatasets.length > 0 &&
                model?.query.variables && (
                  <ResultsErrorBoundary>
                    <Table
                      summaryStatistics={apiMining.state.summaryStatistics}
                      selectedDatasets={selectedDatasets}
                      query={model && model.query}
                      lookup={lookup}
                    />
                  </ResultsErrorBoundary>
                )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    )}
  </>
);
export default Content;
