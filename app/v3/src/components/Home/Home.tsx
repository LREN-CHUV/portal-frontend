import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIExperiment, APIModel } from '../API';
import Articles from './Articles';
import Infos from './Infos';
import Models from './Models';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;

const ModelsLayout = styled.div`
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-column-gap: 8px;
`;

const Title = styled(Panel)`
  font-size: 16px;
  font-weight: bold;
  padding: 1em;
  margin: 0.5em 0;
`;

interface Props extends RouteComponentProps<{}> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
}

export default ({ ...props }: Props) => {
  const { apiCore, apiModel, apiExperiment, history } = props;
  const articles = apiCore.state && apiCore.state.articles;
  const user = apiCore.state && apiCore.state.user;
  const experiments = apiExperiment.state && apiExperiment.state.experiments;

  return (
    <Layout>
      <Infos stats={apiCore.state.stats} />
      <ModelsLayout>
        <div>
          <Title>My Models</Title>
          <Models
            models={apiModel.state.models}
            history={history}
            experiments={experiments}
          />
        </div>
        <div>
          <Title>Recent Articles</Title>
          <Articles articles={articles} history={history} />
        </div>
        <div>
          <Title>Users Models</Title>
          <Models
            models={
              apiModel.state &&
              apiModel.state.models &&
              apiModel.state.models.filter(
                m => m.createdBy && user && user.name && m.createdBy.username !== user.name
              )
            }
            history={history}
            experiments={experiments}
          />
        </div>
      </ModelsLayout>
    </Layout>
  );
};
