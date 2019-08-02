import React, { useEffect, useState } from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { draftStateToHTML } from 'react-wysiwyg-typescript';
import styled from 'styled-components';

import { APICore } from '../API';
import { Article } from '../API/Core';
import Edit from './Edit';

export enum Mode {
  default,
  editing,
  creating
}

const Layout = styled.div`
  padding: 0 48px 0px 48px;
  display: flex;
`;

const PanelLayout = styled(Panel)`
  margin-right: 8px;
`;

const PanelTitle = styled(Panel.Title)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
`;

const Submit = styled.div`
  text-align: right;
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
      const nextArticle = articles.find(a => a.slug === slug);
      if (nextArticle) {
        setCurrentArticle(nextArticle);
      }
    } else {
      setCurrentArticle(articles[0]);
    }
  }, [slug, apiCore.state]);

  const handleSelectArticle = (article: Article) => {
    setEditing(Mode.default);
    setCurrentArticle(article);
  };

  const handleSaveArticle = (id: string, article: Article) => {
    editing === Mode.editing
      ? updateArticle(article.slug, article)
      : createArticle(article);
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

  return (
    <Layout>
      <PanelLayout style={{ flex: 0.3 }}>
        <PanelTitle>
          <h3>My articles</h3>
          <button
            className='btn-primary btn' // tslint:disable-next-line
            onClick={() => {
              setCurrentArticle(initialFormState);
              setEditing(Mode.creating);
            }}>
            New article
          </button>
        </PanelTitle>
        <Panel.Body>
          {apiCore.state &&
            apiCore.state.articles &&
            apiCore.state.articles.map(a => (
              <p key={a.slug}>
                <a
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => handleSelectArticle(a)}>
                  {a.title}
                </a>
              </p>
            ))}
        </Panel.Body>
      </PanelLayout>
      <PanelLayout style={{ flex: 0.6 }}>
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
                  className='btn-primary btn'
                  // tslint:disable-next-line
                  onClick={() => setEditing(Mode.editing)}>
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
      </PanelLayout>
    </Layout>
  );
};
