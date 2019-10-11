import * as React from 'react';
import styled from 'styled-components';
import { Panel } from 'react-bootstrap';

const Title = styled.h3`
  margin: 16px 0 8px 0;
`;

const Body = styled(Panel.Body)`
  margin: 0 0 16px 16px;
  padding: 0;
`;

interface Props {
  title?: string;
  body?: JSX.Element;
}

export default ({ title, body }: Props): JSX.Element => (
  <Panel>
    <Panel.Title>
      <Title>{title}</Title>
    </Panel.Title>
    <Body>{body}</Body>
  </Panel>
);
