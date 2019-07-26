import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIExperiment, APIModel } from '../API';
import { ExperimentResponse } from '../API/Experiment';
import Infos from './Infos';
import Model from './Model';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;

const Models = styled.div`
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-column-gap: 8px;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: bold;
`;

interface Props extends RouteComponentProps<{}> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

export default ({ ...props }: Props) => {
  const { apiCore, apiModel, apiExperiment, history } = props;

  const experiments = apiExperiment.state && apiExperiment.state.experiments;
  return (
    <Layout>
      <Infos stats={apiCore.state.stats} />
      <Models>
        <div>
          <Title>My Models</Title>
          {apiModel.state.models &&
            apiModel.state.models.map(m => (
              <Model key={m.slug} model={m} history={history} experiments={experiments && experiments.filter((e: ExperimentResponse) => m.slug === e.modelDefinitionId
              )}/>
            ))}
        </div>
        <div>
          <Title>Recent Articles</Title>
          
        </div>
        <div>
          <Title>Recent Models</Title>
          
        </div>
      </Models>
    </Layout>
  );
};
