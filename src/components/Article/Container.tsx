import React, { useEffect, useState } from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { draftStateToHTML } from 'react-wysiwyg-typescript';
import styled from 'styled-components';

import { APICore } from '../API';
import { Article } from '../API/Core';
import Edit from './Edit';
import Header from './Header';

export enum Mode {
  default,
  editing,
  creating
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  .panel:first-child {
    flex: 1;
    min-width: 360px;
    margin-right: 8px;
    button {
      white-space: normal;
      text-align: left;
    }
  }
`;

const Submit = styled.div`
  float: right;
`;

const initialFormState: Article = { slug: '', title: '' };

interface Params {
  slug: string;
}
interface Props extends RouteComponentProps<Params> {
  apiCore: APICore;
}

export default ({ apiCore, ...props }: Props) => {
  const [currentArticle, setCurrentArticle] = useState<Article>(
    initialFormState
  );
  const [editing, setEditing] = useState(Mode.default);
  const slug = props.match.params.slug;

  useEffect(() => {
    const articles = apiCore.state && apiCore.state.articles;

    if (!articles) {
      return;
    }

    if (slug !== undefined) {
      if (slug === 'create') {
        setEditing(Mode.creating);
        return;
      }

      const nextArticle = articles.find(a => a.slug === slug);
      if (nextArticle) {
        setCurrentArticle(nextArticle);
      }
    } else if (!currentArticle) {
      setCurrentArticle(articles[0]);
    }
  }, [slug, apiCore.state, currentArticle]);

  const handleSelectArticle = (article: Article) => {
    setEditing(Mode.default);
    setCurrentArticle(article);
  };

  const updateArticle = (id: string, article: Article) => {
    apiCore.updateArticle(id, article).then(() => {
      apiCore.articles();
      setEditing(Mode.default);
    });
  };

  const createArticle = (article: Article) => {
    apiCore.createArticle(article).then(() => {
      apiCore.articles();
      setEditing(Mode.default);
    });
  };

  const handleSaveArticle = (id: string, article: Article) => {
    editing === Mode.editing
      ? updateArticle(article.slug, article)
      : createArticle(article);
  };

  const handleNewArticle = () => {
    setCurrentArticle(initialFormState);
    setEditing(Mode.creating);
  };

  return (
    <Layout>
      <Header handleNewArticle={handleNewArticle} />
      <Content>
        <Panel>
          <Panel.Title>
            <h3>My articles</h3>
          </Panel.Title>
          <Panel.Body>
            {apiCore.state &&
              apiCore.state.articles &&
              apiCore.state.articles.map(a => (
                <div key={a.slug}>
                  <button
                    className="btn btn-link"
                    style={{ textTransform: 'none' }}
                    // tslint:disable-next-line jsx-no-lambda
                    onClick={() => handleSelectArticle(a)}
                  >
                    {a.title}
                  </button>
                </div>
              ))}
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Body>
            {editing ? (
              <Edit
                currentArticle={currentArticle}
                handleSaveArticle={handleSaveArticle}
                setEditing={setEditing}
              />
            ) : (
              <>
                <Submit>
                  <button
                    className="btn-info btn"
                    // tslint:disable-next-line
                    onClick={() => setEditing(Mode.editing)}
                  >
                    Edit
                  </button>
                </Submit>
                <h1>{currentArticle && currentArticle.title}</h1>
                <h3>{currentArticle && currentArticle.abstract}</h3>
                <div>
                  {currentArticle &&
                    currentArticle.content &&
                    draftStateToHTML(currentArticle.content)}
                </div>
              </>
            )}
          </Panel.Body>
        </Panel>
      </Content>
    </Layout>
  );
};
