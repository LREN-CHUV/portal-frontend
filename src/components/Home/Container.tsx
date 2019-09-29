import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIExperiment, APIModel, APIUser } from '../API';
import Articles from './Articles';
import Experiments from './Experiments';
import Infos from './Infos';

const Layout = styled.section``;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 66% 33%;
  grid-column-gap: 8px;
`;

const PanelContainer = styled(Panel)`
  h2 {
    font-size: 16px;
    font-weight: bold;
  }
  padding: 1em;
  margin: 0 0 1em 0;
  background-color: #d3d3d399;
`;

interface Props extends RouteComponentProps<{}> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiUser: APIUser;
}

export default ({ ...props }: Props): JSX.Element => {
  const { apiCore, apiModel, apiExperiment, apiUser, history } = props;
  const articles = apiCore.state && apiCore.state.articles;
  const user = apiUser.state && apiUser.state.user;
  const experiments = apiExperiment.state && apiExperiment.state.experiments;

  const handleSelectArticle = (id: string): void => {
    history.push(`/articles/${id}`);
  };

  const handleNewArticle = (): void => {
    history.push(`/articles/create`);
  };

  const handleNewExperiment = (modelId: string | undefined): void => {
    history.push(`/experiment/${modelId}`);
  };
  const handleSelectExperiment = (
    modelId: string | undefined,
    experimentId: string
  ): void => {
    history.push(`/experiment/${modelId}/${experimentId}`);
  };

  return (
    <Layout>
      <Infos stats={apiCore.state.stats} handleNewArticle={handleNewArticle} />
      <ContentLayout>
        <div>
          <PanelContainer>
            <h2>My experiments</h2>
            <Experiments
              models={apiModel.state.models}
              experiments={experiments}
              handleSelectExperiment={handleSelectExperiment}
              handleNewExperiment={handleNewExperiment}
            />
          </PanelContainer>
        </div>
        <div>
          <PanelContainer>
            <h2>Recent Articles</h2>
            <Articles
              articles={articles}
              handleSelectArticle={handleSelectArticle}
            />
          </PanelContainer>
          <PanelContainer>
            <h2>Shared experiments</h2>

            <Experiments
              models={
                apiModel.state &&
                apiModel.state.models &&
                apiModel.state.models.filter(
                  m =>
                    m.createdBy &&
                    user &&
                    user.username &&
                    m.createdBy.username !== user.username
                )
              }
              handleSelectExperiment={handleSelectExperiment}
              handleNewExperiment={handleNewExperiment}
              experiments={
                experiments &&
                experiments.filter(
                  e =>
                    e.user &&
                    user &&
                    user.username &&
                    e.user.username !== user.username
                )
              }
            />
          </PanelContainer>
        </div>
      </ContentLayout>
    </Layout>
  );
};
