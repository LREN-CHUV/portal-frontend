import React, { useEffect } from 'react';
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

const Title = styled.h3`
  margin: 16px 0;
`;

const Body = styled(Panel.Body)`
  padding: 0 16px;
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
  const user = apiUser && apiUser.state && apiUser.state.user;
  const experiments = apiExperiment.state && apiExperiment.state.experiments;

  useEffect(() => {
    if (
      !apiUser.state.loading &&
      apiUser.state.authenticated &&
      !apiUser.state.agreeNDA
    ) {
      history.push('/tos');
    }
  }, [
    apiUser.state.agreeNDA,
    apiUser.state.authenticated,
    apiUser.state.loading,
    history
  ]);

  const handleSelectArticle = (id: string): void => {
    history.push(`/articles/${id}`);
  };

  const handleNewArticle = (): void => {
    history.push(`/articles/create`);
  };

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
    <Layout>
      <Infos apiCore={apiCore} handleNewArticle={handleNewArticle} />
      <ContentLayout>
        <div>
          <Panel>
            <Panel.Title>
              <Title>My experiments</Title>
            </Panel.Title>
            <Body>
              <Experiments
                models={apiModel.state.models}
                experiments={experiments}
                handleSelectExperiment={handleSelectExperiment}
                handleNewExperiment={handleNewExperiment}
              />
            </Body>
          </Panel>
        </div>
        <div>
          <Panel>
            <Panel.Title>
              <Title>Recent Articles</Title>
            </Panel.Title>
            <Body>
              <Articles
                articles={articles}
                handleSelectArticle={handleSelectArticle}
              />
            </Body>
          </Panel>
          <Panel>
            <Panel.Title>
              <Title>Shared experiments</Title>
            </Panel.Title>
            <Body>
              <Experiments
                models={
                  apiModel.state &&
                  apiModel.state.models &&
                  apiModel.state.models.filter(
                    m =>
                      m.createdBy &&
                      user &&
                      user.username &&
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
            </Body>
          </Panel>
        </div>
      </ContentLayout>
    </Layout>
  );
};
