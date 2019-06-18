import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIModel } from '../API';
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

interface Props extends RouteComponentProps<{}> {
  //   apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

export default ({ ...props }: Props) => {
  const { apiCore, apiModel, history } = props;
  return (
    <Layout>
      <Infos stats={apiCore.state.stats} />
      <Models>
      <div>
          <h1>Recent Models</h1>
          {apiModel.state.models && apiModel.state.models.map(m => <Model key={m.slug} model={m} history={history} />)}
        </div>
      <div>
          <h1>Recent Articles</h1>
          {apiModel.state.models && apiModel.state.models.map(m => <Model key={m.slug} model={m} history={history} />)}
        </div>
        <div>
          <h1>My Models</h1>
          {apiModel.state.models && apiModel.state.models.map(m => <Model key={m.slug} model={m} history={history} />)}
        </div>
      </Models>
    </Layout>
  );
};
