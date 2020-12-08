import * as React from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import logo from '../../images/hbp-logo.png';

import MIPContext from '../App/MIPContext';
import HelpButton from './HelpButton';

interface Props {
  name?: string;
  datacatalogueUrl: string | undefined;
  logout?: () => {};
  children: JSX.Element;
}

const NavBar = styled.nav`
  position: fixed;
  z-index: 1;
  top: 0;
  width: 100%;
  font-family: 'Open Sans Condensed', sans-serif;
  font-weight: bold;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  box-shadow: 2px 2px 2px #333;

  #experiment-dropdown,
  #help-dropdown {
    font-size: 16px;
  }

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

  font-weight: bold;

  div {
    background: url(${logo}) left center no-repeat;
    width: 40px;
    height: 40px;
  }

  a {
    font-size: 32px !important;
  }
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 0 16px 0 0;

  .active {
    color: #5bc0de !important;
  }
`;

const RightLinks = styled(Links)`
  display: flex;
  align-items: center;
  // margin-left: auto;

  button {
    color: white;
    font-size: 16px;
  }
`;

const Link = styled(NavLink)`
  font-size: 16px;
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

const DropdownWrapper = styled.div`
  .dropdown > button {
    font-weight: bold;
    font-size: 16px;
    text-decoration: none;
    color: white;
    box-shadow: none;
  }
`;

const ALink = styled.a`
  color: white;
  font-size: 16px;
  margin: 0px 16px 0px 0px;
`;

export default ({
  name,
  datacatalogueUrl,
  logout,
  children
}: Props): JSX.Element => {
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
          <GroupLink to="/explore">Variables</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/review">Analysis</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/experiment">Experiment</GroupLink>
        </Group>
        <DropdownWrapper>
          <Dropdown>
            <Dropdown.Toggle variant="link" id="dropdown-nav-experiments">
              My Experiments
            </Dropdown.Toggle>
            <Dropdown.Menu>{children}</Dropdown.Menu>
          </Dropdown>
        </DropdownWrapper>
        <Link to="/galaxy">Workflow</Link>
        {datacatalogueUrl && (
          <ALink
            href={datacatalogueUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Data Catalogue
          </ALink>
        )}
      </Links>
      <RightLinks>
        <MIPContext.Consumer>
          {({ toggleTutorial }): JSX.Element =>
            (
              <>
                <Button onClick={toggleTutorial}>User Guide</Button>
              </>
            ) || <></>
          }
        </MIPContext.Consumer>
        <HelpButton showTraining={true} />
        {logout && (
          <Button
            onClick={(): void => {
              logout();
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        )}
      </RightLinks>
    </NavBar>
  );
};
