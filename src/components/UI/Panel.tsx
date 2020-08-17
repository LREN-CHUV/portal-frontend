import * as React from 'react';
import styled from 'styled-components';
import { Card } from 'react-bootstrap';

const Title = styled.h3`
  margin: 16px 0 8px 0;
`;

const Body = styled(Card.Body)`
  margin: 0 0 16px 16px;
  padding: 0;
`;

interface Props {
  title?: string;
  body?: JSX.Element;
}

export default ({ title, body }: Props): JSX.Element => (
  <Card>
    <Card.Title>
      <Title>{title}</Title>
    </Card.Title>
    <Body>{body}</Body>
  </Card>
);
