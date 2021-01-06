import * as React from 'react';
import { DropdownButton } from 'react-bootstrap';
import { BsBook, BsFilm, BsFillEnvelopeFill } from 'react-icons/bs';

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
    padding: 0.8em;
    min-width: 200px;

    p > a {
      font-family: 'Open Sans', sans-serif;
      font-weight: normal !important;
      padding: 0.5em;
      color: #007bff !important;
      font-size: 0.9rem;

      :hover {
        color: #0056b3 !important;
        text-decoration: underline;
      }
    }

    svg {
      margin-right: 4px;
      margin-top: -2px;
      color: black;
    }
  }

  .btn-link,
  .btn {
    font-weight: bold !important;
    border: 0;
    text-decoration: none;
    box-shadow: none;

    :active {
      border: 0;
      color: #5bc0de !important;
    }

    :hover {
      border: 0;
      color: #ccc !important;
    }
  }
`;

export default ({ showTraining }: { showTraining?: boolean }): JSX.Element => {
  return (
    <MainBox>
      <DropdownButton variant="link" id={'help-dropdown'} title={'Help'}>
        <p>
          <a
            href="https://mip.ebrains.eu/documentation/"
            // tslint:disable-next-line jsx-no-lambda
            onSelect={(): void => {
              window.open('https://mip.ebrains.eu/documentation/');
            }}
          >
            <BsBook /> MIP Documentation
          </a>
        </p>
        {showTraining && (
          <p>
            <NavLink to="/training">
              <BsFilm /> MIP Training
            </NavLink>
          </p>
        )}
        <p>
          <a href="mailto://support@ebrains.eu">
            <BsFillEnvelopeFill /> Email us at support@ebrains.eu
          </a>
        </p>
        <Helpdesk />
      </DropdownButton>
    </MainBox>
  );
};
