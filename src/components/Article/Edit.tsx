import React, { useEffect, useState } from 'react';
import Draft, {
  draftToRaw,
  EmptyState,
  rawToDraft
} from 'react-wysiwyg-typescript';
import styled from 'styled-components';

import { Article } from '../API/Core';
import { Mode } from './Container';

const Submit = styled.div`
  text-align: right;
  button {
    margin-left: 8px;
  }
`;

interface Props {
  currentArticle: Article;
  handleSaveArticle: (slug: string, article: Article) => void;
  setEditing: any;
}

export default ({ currentArticle, handleSaveArticle, setEditing }: Props) => {
  const [article, setArticle] = useState<Article>(currentArticle);
  const [content, setContent] = useState(EmptyState);

  useEffect(() => {
    setArticle(currentArticle);
    if (currentArticle.content) {
      const nextContent = rawToDraft(currentArticle.content);
      if (nextContent) {
        setContent(nextContent);
      }
    }
  }, [currentArticle]);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setArticle({ ...article, [name]: value });
  };

  const onEditorStateChange = (props: any) => {
    setContent(props);
    setArticle({ ...article, content: draftToRaw(props) });
  };

  return (
    <form
      onSubmit={(event: any) => {
        // tslint:disable-next-line
        event.preventDefault();
        handleSaveArticle(article.slug, article);
      }}
    >
      <Submit>
        <button className="btn-info btn">Save</button>
        <button
          className="btn-info btn"
          // tslint:disable-next-line
          onClick={() => {
            setEditing(Mode.default);
          }}
        >
          Cancel
        </button>
      </Submit>
      <div className="form-group">
        <label className="control-label">Title</label>
        <input
          className="form-control"
          type="text"
          name="title"
          value={article.title}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label className="control-label">Abstract</label>
        <textarea
          className="form-control"
          name="abstract"
          value={article.abstract}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label className="control-label">Content</label>
        <Draft
          editorState={content}
          onEditorStateChange={onEditorStateChange}
        />
      </div>
    </form>
  );
};
