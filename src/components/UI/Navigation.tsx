import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import logo from '../../images/hbp-logo.png';
import HelpButton from './HelpButton';

interface Props {
  name?: string;
}

const NavBar = styled.nav`
  font-family: 'Open Sans Condensed';
  background: #00000077;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
  box-shadow: 2px 2px 2px #333;

  a:link,
  a:visited {
    color: #fff;
    text-decoration: none;
  }

  a:hover,
  a:active {
    color: #ccc;
    text-decoration: none;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 0 16px;
  height: 44px;

  font-size: 32px;
  font-weight: bold;

  div {
    background: url(${logo}) left center no-repeat;
    width: 40px;
    height: 40px;
  }
`;

const Links = styled.div`
  display: flex;
  margin: 0 16px 0 0;

  .active {
    color: #5bc0de !important;
  }
`;

const RightLinks = styled(Links)`
  display: flex;
  align-items: center;
  margin-left: auto;

  button {
    color: white;
  }
`;

const Link = styled(NavLink)`
  margin: 0 16px 0 0;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  margin: 0 16px;
  span {
    color: white;
    margin: 0 8px 0 0;
  }
`;

const GroupLink = styled(Link)`
  margin: 0 8px 0 0;
`;

export default ({ name }: Props): JSX.Element => {
  const instanceName = name || 'MIP';
  return (
    <NavBar>
      <Brand>
        <Link to="/">
          <div title="Human Brain Project"></div>
        </Link>
        <Link to="/">{instanceName}</Link>
      </Brand>
      <Links>
        <Group>
          <GroupLink to="/explore">Explore</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/review">Analysis</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/experiment">Experiment</GroupLink>
        </Group>
        <Link to="/galaxy">Workflow</Link>
        <Link to="/articles">Articles</Link>
      </Links>
      <RightLinks>
        <Link to="/profile">Profile</Link>
        <HelpButton />
      </RightLinks>
    </NavBar>
  );
};
