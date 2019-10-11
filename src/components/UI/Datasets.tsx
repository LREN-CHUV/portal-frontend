import * as React from 'react';
import styled from 'styled-components';

import { ModelResponse } from '../API/Model';
import Panel from '../UI/Panel';

const Body = styled.div`
  p {
    margin: 0;
  }
`;

const Subtitle = styled.h5`
  font-weight: bold;
  margin-bottom: 4px;
`;

interface Props {
  model?: ModelResponse;
}

class Model extends React.Component<Props> {
  public render(): JSX.Element {
    const { model } = this.props;

    const query = model && model.query;

    return (
      <Panel
        title="Datasets"
        body={
          query && (
            <Body>
              {query.trainingDatasets && query.trainingDatasets.length > 0 && (
                <Subtitle>Training datasets</Subtitle>
              )}
              {query.trainingDatasets &&
                query.trainingDatasets.map((v: any) => (
                  <p key={v.code}>{v.code}</p>
                ))}
              {query.validationDatasets &&
                query.validationDatasets.length > 0 && (
                  <Subtitle>Validation dataset</Subtitle>
                )}
              {query.validationDatasets &&
                query.validationDatasets.map((v: any) => (
                  <p key={v.code}>{v.code}</p>
                ))}
            </Body>
          )
        }
      />
    );
  }
}

export default Model;
