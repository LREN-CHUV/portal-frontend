import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIExperiment, APIModel, APIUser } from '../API';
import Articles from './Articles';
import Experiments from './Experiments';
import Infos from './Infos';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;

const ModelsLayout = styled.div`
  display: grid;
  grid-template-columns: 66% 33%;
  grid-column-gap: 8px;
`;

const PanelTitle = styled(Panel)`
  h2 {
    font-size: 16px;
    font-weight: bold;
  }
  padding: 1em;
  margin: 0 0 1em 0;
`;

interface Props extends RouteComponentProps<{}> {
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiUser: APIUser;
}

export default ({ ...props }: Props) => {
  const { apiCore, apiModel, apiExperiment, apiUser, history } = props;
  const articles = apiCore.state && apiCore.state.articles;
  const user = apiUser.state && apiUser.state.user;
  const experiments = apiExperiment.state && apiExperiment.state.experiments;

  const handleSelectArticle = (id: string) => {
    history.push(`/v3/articles/${id}`);
  };

  const handleNewArticle = () => {
    history.push(`/v3/articles/create`);
  };

  const handleNewExperiment = (modelId: string | undefined) => {
    history.push(`/v3/experiment/${modelId}`);
  };
  const handleSelectExperiment = (
    modelId: string | undefined,
    experimentId: string
  ) => {
    history.push(`/v3/experiment/${modelId}/${experimentId}`);
  };

  return (
    <Layout>
      <Infos stats={apiCore.state.stats} handleNewArticle={handleNewArticle} />
      <ModelsLayout>
        <div>
          <PanelTitle>
            <h2>My experiments</h2>
            <Experiments
              models={apiModel.state.models}
              experiments={experiments}
              handleSelectExperiment={handleSelectExperiment}
              handleNewExperiment={handleNewExperiment}
            />
          </PanelTitle>
        </div>
        <div>
          <PanelTitle>
            <h2>Recent Articles</h2>
            <Articles
              articles={articles}
              handleSelectArticle={handleSelectArticle}
            />
          </PanelTitle>
          <PanelTitle>
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
          </PanelTitle>
        </div>
      </ModelsLayout>
    </Layout>
  );
};
