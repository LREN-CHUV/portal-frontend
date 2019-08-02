import moment from 'moment';
import React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

const StyledPanel = styled(Panel)``;

const Heading = styled(Panel.Heading)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 0px none transparent;
  h2 {
    flex: 2;
    font-size: 13px;
    ￼color: #9e9e9e;
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    font-weight: bold;
  }
`;

const PanelBody = styled(Panel.Body)`
  p {
    margin: 0;
  }
`;

const PanelFooter = styled(Panel.Footer)`
  border: 0px none transparent;
  font-size: x-small;
`;

interface Props {
  articles: any[] | undefined;
  handleSelectArticle: (id: string) => void;
}
export default ({ articles, handleSelectArticle }: Props) => {
  return (
    <>
      {!articles ||
        (articles && articles.length === 0 && <p>No article available</p>)}
      {articles &&
        articles.length > 0 &&
        articles.map(article => (
          <StyledPanel key={article.slug}>
            <Heading>
              <h2>
                <a
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => {
                    handleSelectArticle(article.slug);
                  }}>
                  {article.title}
                </a>
              </h2>
            </Heading>
            <PanelBody>{article.abstract}</PanelBody>
            <PanelFooter>
              <span>
                by {article.createdBy && article.createdBy.username},{' '}
              </span>
              <span>
                {article.createdAt && moment(article.createdAt).fromNow()}
              </span>
            </PanelFooter>
          </StyledPanel>
        ))}
    </>
  );
};
