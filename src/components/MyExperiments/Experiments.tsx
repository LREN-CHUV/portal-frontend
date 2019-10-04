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
`;

const Experiment = styled(Panel)`
  margin-right: 8px;
  min-width: 360px;
  flex: 1 1 auto;
`;

const ExperimentBody = styled(Panel.Body)``;

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
              <ExperimentBody>
                <h2>{experiment && experiment.name}</h2>
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
                <div>
                  <Button
                    bsSize="small"
                    // tslint:disable-next-line jsx-no-lambda
                    onClick={(): void =>
                      handleNewExperiment(experiment.modelDefinitionId)
                    }
                  >
                    New experiment
                  </Button>
                  <Button
                    bsSize="small"
                    // tslint:disable-next-line jsx-no-lambda
                    onClick={(): void =>
                      handleSelectExperiment(
                        experiment.modelDefinitionId,
                        experiment.uuid
                      )
                    }
                  >
                    View
                  </Button>
                </div>
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
