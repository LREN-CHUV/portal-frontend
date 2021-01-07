import * as React from 'react';
import { Container, Card, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as EBRAINS } from '../../images/ebrains.svg';
import HBPLogo from '../../images/hbp_logo_135.png';
import Helpdesk from './Helpdesk';

const Logo = styled.img`
  width: 135px;
  height: 135px;
  display: block;
  margin: 16px auto 32px auto;
`;

const StyledContainer = styled(Container)`
  margin: 16px auto 0 auto;
  display: flex;
  flex-direction: row;
  background-color: white;
  padding: 0;

  @media (min-width: 1400px) {
    max-width: 1280px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StyledJumbotron = styled(Jumbotron)`
  margin-bottom: 0;
  border-radius: 0;
  flex: 2;
`;

const SideCard = styled(Card)`
  margin: 0 8px;
  padding: 16px;
  flex: 1;
`;

export default (): JSX.Element => {
  return (
    <StyledContainer>
      <StyledJumbotron>
        <h1 className="display-4">The Medical Informatics Platform</h1>
        <p className="lead">
          The Medical Informatics Platform (MIP) is a privacy preserving,
          federated data processing and analysis system
        </p>
        <hr className="my-4" />
        <p>
          The MIP is designed to help clinicians, clinical scientists, and
          clinical data scientists aiming to adopt advanced analytics for
          diagnosis and research in clinics.
        </p>
        <p>
          More information about the MIP can be found on{' '}
          <a
            href="https://ebrains.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            EBRAINS website
          </a>
        </p>
        <hr className="my-4" />
        <h3>More about the MIP</h3>
        <ul>
          <li>
            Watch the <Link to={`/training`}>video tutorials</Link>
          </li>
          <li>
            An introduction to the MIP:{' '}
            <a
              href="https://mip.ebrains.eu/documentation/Deployment%20Pack/1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Executive Summary
            </a>
          </li>
          <li>
            <a
              href="https://mip.ebrains.eu/documentation/Deployment%20Pack/9"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAQ
            </a>
          </li>
          <li>
            Read about the included algorithms:{' '}
            <a
              href="https://mip.ebrains.eu/documentation/Technical%20Documents/11"
              target="_blank"
              rel="noopener noreferrer"
            >
              Federated Analysis Algorithms Descriptions
            </a>
          </li>
          <li>
            <a
              href="https://github.com/HBPMedical/mip-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Technical overview
            </a>
          </li>
        </ul>
        <EBRAINS />
      </StyledJumbotron>
      <SideCard>
        <Card.Title>
          <Logo alt="HBP logo" title={'Human Brain Project'} src={HBPLogo} />
          <h3>Access the MIP</h3>
        </Card.Title>
        <Card.Body>
          <p>
            If you are a registered user of the MIP, you can access it by login
            on the top right button
          </p>
          <p>
            <strong>You need an EBRAINS user account to access the MIP.</strong>
          </p>
          <p>
            Access to the different federations will be granted on a case-by
            case basis, and is only possible after you have signed in on the
            platform and your user account is registered. Specify your request
            in the form below or by mail at{' '}
            <a href="mailto://support@ebrains.eu">support@ebrains.eu</a>
          </p>
          <Helpdesk formId={'login-mailform'} />
        </Card.Body>
      </SideCard>
    </StyledContainer>
  );
};
