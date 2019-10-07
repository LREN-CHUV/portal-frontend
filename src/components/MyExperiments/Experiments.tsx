import moment from 'moment';
import React, { useState } from 'react';
import { Button, Panel } from 'react-bootstrap';
import styled from 'styled-components';

import { Engine, ExperimentResponse, Node, Result } from '../API/Experiment';
import { ModelResponse } from '../API/Model';
import DeprecatedRenderResult from '../Result/deprecated/RenderResult';
import RenderResult from '../Result/RenderResult';

const Experiments = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`;

const Experiment = styled(Panel)`
  flex: 0 0 calc(33% - 4px);
`;

const ExperimentBody = styled(Panel.Body)`
  margin: 0;
  padding-top: 0;

  p {
    margin: 0;
  }

  button {
    margin-top: 8px;
    float: right;
  }
`;

const PanelFooter = styled(Panel.Footer)`
  border: 0px none transparent;
  font-size: x-small;
`;

interface Props {
  experiments: ExperimentResponse[] | undefined;
  models: ModelResponse[] | undefined;
  handleSelectExperiment: (
    modelId: string | undefined,
    experimentId: string
  ) => void;
  handleNewExperiment: (modelId: string | undefined) => void;
}
export default ({
  models,
  experiments,
  handleSelectExperiment,
  handleNewExperiment
}: Props): JSX.Element => {
  return (
    <Experiments>
      {!experiments ||
        (experiments && experiments.length === 0 && (
          <Panel>
            <Panel.Body>No experiment available</Panel.Body>
          </Panel>
        ))}
      {experiments &&
        experiments.map(experiment => {
          const model =
            models &&
            models.find(
              (m: ModelResponse) => m.slug === experiment.modelDefinitionId
            );

          const results = experiment && experiment.results;

          return (
            <Experiment key={experiment.uuid}>
              <Panel.Title>
                <h3>
                  <a
                    onClick={(): void =>
                      handleSelectExperiment(
                        experiment.modelDefinitionId,
                        experiment.uuid
                      )
                    }
                  >
                    {experiment && experiment.name}
                  </a>
                </h3>
              </Panel.Title>
              <ExperimentBody>
                {model && (
                  <>
                    {model.query.variables && (
                      <p>
                        <b>Variables</b>:{' '}
                        {model.query.variables.map((v: any) => v.code)}
                      </p>
                    )}
                    {model.query.coVariables !== undefined &&
                      model.query.coVariables.length > 0 && (
                        <p>
                          <b>Covariables</b>:{' '}
                          {model.query.coVariables.map(
                            (v: any) => `${v.code}, `
                          )}
                        </p>
                      )}
                    {model.query.groupings !== undefined &&
                      model.query.groupings.length > 0 && (
                        <p>
                          <b>Groupings</b>:{' '}
                          {model.query.groupings.map((v: any) => `${v.code}, `)}
                        </p>
                      )}
                  </>
                )}
                <Button
                  bsSize="small"
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={(): void =>
                    handleNewExperiment(experiment.modelDefinitionId)
                  }
                >
                  New experiment
                </Button>
              </ExperimentBody>
              <PanelFooter>
                <span>
                  by {experiment && experiment.user && experiment.user.username}
                  ,{' '}
                </span>
                <span>
                  {experiment &&
                    experiment.created &&
                    moment(experiment.created).fromNow()}
                </span>
              </PanelFooter>
            </Experiment>
          );
        })}
    </Experiments>
  );
};
