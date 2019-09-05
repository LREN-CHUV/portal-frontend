import React from 'react';
import { Button } from 'react-bootstrap';
import { FaAtom, FaEdit, FaPlusCircle, FaUsers } from 'react-icons/fa';
import styled from 'styled-components';

import { Stats } from '../API/Core';

const Infos = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 16px;
`;

const Panel = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: top;
  margin-right: 8px;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  height: 144px;

  &:last-child {
    margin-right: 0;
  }
`;

const PanelTitle = styled.div`
  flex: 1;
  padding: 8px;
`;

const Title = styled.h1`
  color: white;
  text-transform: uppercase;
  font-weight: bold;
  font-size: smaller;
  margin: 8px 0 24px 0;
`;

interface IconProps {
  size?: number;
}

const Icon = styled.div<IconProps>`
  font-size: ${p => p.size || 50}px;
  color: black;
`;

const PanelBody = styled.div`
  text-align: right;
  vertical-align: bottom;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 16px;
`;

const Count = styled.h2`
  font-size: 50px;
  font-family: 'Open Sans Condensed';
  color: white;
  margin-bottom: 0px;
`;

const Summary = styled.p`
  font-size: small;
  color: white;
  font-weight: bold;
  margin-bottom: 0px;
`;

const Plus = styled(Button)`
  margin: 0;
  padding:0;
  div {
    margin: 0;
    padding: 0;
  }
`;

interface Props {
  stats?: Stats;
  handleNewArticle: () => void
}

export default ({ stats, handleNewArticle }: Props) => (
  <Infos>
    <Panel style={{ backgroundColor: 'rgba(222, 147, 109, 0.4)' }}>
      <PanelTitle>
        <Title>users</Title>
        <Icon>
          <FaUsers />
        </Icon>
      </PanelTitle>
      <PanelBody>
        <Count>{(stats && stats.users) || 0}</Count>
        <Summary>Scientists registered on the platform</Summary>
      </PanelBody>
    </Panel>

    <Panel style={{ backgroundColor: 'rgba(59,139,144,.25)' }}>
      <PanelTitle>
        <Title>articles</Title>
        <Icon>
          <FaEdit />
        </Icon>
      </PanelTitle>
      <PanelBody>
        <Count>{(stats && stats.articles) || 0}</Count>
        <Summary>Articles written on the platform</Summary>
      </PanelBody>
    </Panel>

    <Panel style={{ backgroundColor: 'rgba(158,158,158,.25)' }}>
      <PanelTitle>
        <Title>variables</Title>
        <Icon>
          <FaAtom />
        </Icon>
      </PanelTitle>
      <PanelBody>
        <Count>{(stats && stats.variables) || 0}</Count>
        <Summary>Records in database</Summary>
      </PanelBody>
    </Panel>

    <Panel style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
      <PanelTitle>
        <Title />
        <Icon>
          <FaUsers />
        </Icon>
      </PanelTitle>
      <PanelBody>
        <Count>Write</Count>
        <Summary>an article</Summary>
        <Plus bsStyle='link' style={{ backgroundColor: 'rgba(0,0,0,0)' }} onClick={handleNewArticle}>
          <Icon size={16}>
            <FaPlusCircle />
          </Icon>
        </Plus>
      </PanelBody>
    </Panel>
  </Infos>
);
