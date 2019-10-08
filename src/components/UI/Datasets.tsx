import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';
import { ModelResponse } from '../API/Model';

const Body = styled(Panel.Body)`
  padding: 0 16px 16px 16px;

  var {
    display: block;
  }
`;

const Title = styled.h3`
  margin: 16px 0 0 0;
`;

const Subtitle = styled.h5`
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
      <Panel className="model">
        <Panel.Title>
          <Title>Datasets</Title>
        </Panel.Title>
        <Body>
          {query && (
            <>
              {query.trainingDatasets && query.trainingDatasets.length > 0 && (
                <Subtitle>Training datasets</Subtitle>
              )}
              {query.trainingDatasets &&
                query.trainingDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {query.validationDatasets &&
                query.validationDatasets.length > 0 && (
                  <Subtitle>Validation dataset</Subtitle>
                )}
              {query.validationDatasets &&
                query.validationDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
            </>
          )}
        </Body>
      </Panel>
    );
  }
}

export default Model;
