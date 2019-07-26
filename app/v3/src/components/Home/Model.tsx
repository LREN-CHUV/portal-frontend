import moment from 'moment';
import React from 'react';
import { Button, DropdownButton, MenuItem, Panel } from 'react-bootstrap';
import styled from 'styled-components';

import { ExperimentResponse } from '../API/Experiment';
import { ModelResponse } from '../API/Model';

const StyledPanel = styled(Panel)``;

const Heading = styled(Panel.Heading)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 0px none transparent;
  h2 {
    flex: 2;
    font-size: 13px;
    ￼color: #9e9e9e;
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    font-weight: bold;
  }
`;

const PanelBody = styled(Panel.Body)`
  p {
    margin: 0;
  }
`;

const PanelFooter = styled(Panel.Footer)`
  border: 0px none transparent;
  font-size: x-small;
`;

interface Props {
  experiments: ExperimentResponse[] | undefined;
  model: ModelResponse;
  history: any;
}
export default ({ model, experiments, history }: Props) => {
  const { query } = model;

  const handleNewExperiment = (modelId: string | undefined) => {
    history.push(`/v3/experiment/${modelId}`);
  };
  const handleGoToExperiment = (modelId: string | undefined, experimentId: string) => {
    history.push(`/v3/experiment/${modelId}/${experimentId}`);
  };

  return (
    <StyledPanel>
      <Heading>
        <h2>{model && model.title}</h2>
        <div>
          <Button
            bsSize='small'
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => {
              history.push(`/v3/review/${model.slug}`);
            }}>
            View
          </Button>
          <DropdownButton
            bsSize='small'
            id={'home-model-dropdown'}
            title={'Experiments'}>
            <MenuItem
              eventKey={'cancel'}
              key={'cancel'}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleNewExperiment(model.slug)}>
              New experiment
            </MenuItem>
            {experiments &&
              experiments.map(e => (
                <MenuItem
                  eventKey={'cancel'}
                  key={'cancel'}
                  // tslint:disable-next-line jsx-no-lambda
                  onSelect={() => handleGoToExperiment(model.slug, e.uuid)}>
                  {e.name}
                </MenuItem>
              ))}
          </DropdownButton>
        </div>
      </Heading>
      <PanelBody>
        <>
          {query.variables && (
            <p>
              <b>Variables</b>: {query.variables.map((v: any) => v.code)}
            </p>
          )}
          {query.coVariables !== undefined && query.coVariables.length > 0 && (
            <p>
              <b>Covariables</b>:{' '}
              {query.coVariables.map((v: any) => `${v.code}, `)}
            </p>
          )}
          {query.groupings !== undefined && query.groupings.length > 0 && (
            <p>
              <b>Groupings</b>: {query.groupings.map((v: any) => `${v.code}, `)}
            </p>
          )}
        </>
      </PanelBody>
      <PanelFooter>
        <span>by {model && model.createdBy && model.createdBy.username}, </span>
        <span>
          {model && model.createdAt && moment(model.createdAt).fromNow()}
        </span>
      </PanelFooter>
    </StyledPanel>
  );
};
