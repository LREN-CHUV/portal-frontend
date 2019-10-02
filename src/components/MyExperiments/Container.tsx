import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APIExperiment, APIModel } from '../API';
import Experiments from './Experiments';

const Body = styled(Panel.Body)`
  padding: 0 16px;
`;

const PanelBody = styled(Panel.Body)`
  display: flex;
  padding-top: 15px !important;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0px !important;

  h3 {
    flex: 2;
    margin: 0 0 0 16px;
  }
`;

interface Props extends RouteComponentProps<{}> {
  apiExperiment: APIExperiment;
  apiModel: APIModel;
}

export default ({ ...props }: Props): JSX.Element => {
  const { apiModel, apiExperiment, history } = props;
  const experiments = apiExperiment.state && apiExperiment.state.experiments;

  const handleNewExperiment = (modelId: string | undefined): void => {
    apiModel.one(modelId).then(() => {
      history.push(`/experiment`);
    });
  };
  const handleSelectExperiment = (
    modelId: string | undefined,
    experimentId: string
  ): void => {
    history.push(`/experiment/${modelId}/${experimentId}`);
  };

  return (
    <>
      <Panel>
        <PanelBody>
          <h3>My experiments</h3>
        </PanelBody>
      </Panel>
      <Panel>
        <Body>
          <Experiments
            models={apiModel.state.models}
            experiments={experiments}
            handleSelectExperiment={handleSelectExperiment}
            handleNewExperiment={handleNewExperiment}
          />
        </Body>
      </Panel>
    </>
  );
};
