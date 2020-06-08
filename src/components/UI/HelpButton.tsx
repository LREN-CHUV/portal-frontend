import * as React from 'react';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import Helpdesk from './Helpdesk';

const MainBox = styled.div`
  .dropdown-menu {
    right: 0;
    left: auto;
    width: fit-content !important;
    max-height: none;
    overflow-y: auto;
    padding: 0.5em 1em;

    li {
      padding: 0.5em 0;
      margin: 0;
    }

    li > a {
      padding: 0;
      color: black;
    }
  }
`;

const Link = styled(NavLink)`
  font-size: 14px;
  margin: 0 16px 0 0;
  color: #000;
`;

export default ({ showTraining }: { showTraining?: boolean }): JSX.Element => {
  return (
    <MainBox>
      <DropdownButton
        noCaret={false}
        bsStyle="link"
        id={'help-dropdown'}
        title={'Help'}
      >
        <MenuItem
          // tslint:disable-next-line jsx-no-lambda
          onSelect={() => {
            window.open('https://mip.ebrains.eu/documentation/');
          }}
        >
          <Glyphicon glyph="book" /> MIP Documentation
        </MenuItem>
        {showTraining && (
          <li>
            <Link to="/training">
              <Glyphicon glyph="film" /> MIP Training
            </Link>
          </li>
        )}
        <li>
          <Glyphicon glyph="envelope" /> Email us at{' '}
          <a href="mailto://support@ebrains.eu">support@ebrains.eu</a>
        </li>
        <Helpdesk />
      </DropdownButton>
    </MainBox>
  );
};
