import * as React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

import HBPLogo from '../../images/hbp_logo_320.png';
import { APIUser, backendURL } from '../API';
import HelpButton from './HelpButton';

const MainBox = styled.div`
  position: fixed;
  z-index: 1000;
  padding: 1em;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #000000;
  overflow: hidden !important;

  display: flex;
  flex-direction: column;

  img {
    margin: -64px auto 0 auto;
    background-color: #ffffff00;
  }

  section {
    margin: 0;
  }

  .btn-link {
    color: white;
  }

  h1,
  h2,
  h3,
  p,
  ul,
  li {
    color: white;
  }

  h2 {
    text-align: center;
    margin: 0;
  }

  h1 {
    text-align: center;
    margin-bottom: 16px;
  }

  .dropdown-menu {
    left: 0 !important;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Columns = styled.div`
  display: flex;
  padding: 0 10%;

  section {
    flex: 1;
    padding: 0 1em;
    text-align: justify;
  }

  section p {
    margin-right: 16px;
  }

  div {
    flex: 1;

    h3 {
      margin: 0;
    }

    ul {
      padding: 0.5em 0;
    }
  }
`;

export default (): JSX.Element => {
  const handleLoginPress = (): void => {
    window.location.href = `${backendURL}/login/hbp`;
  };

  return (
    <MainBox>
      <ActionBar>
        <div style={{ left: 100 }}>
          <HelpButton />
        </div>
        <Button onClick={handleLoginPress} bsStyle="default" type="submit">
          Login
        </Button>
      </ActionBar>
      <img alt="HBP logo" title={'Human Brain Project'} src={HBPLogo} />
      <h2>Human Brain Project</h2>
      <h1>THE MEDICAL INFORMATICS PLATFORM</h1>

      <Columns>
        <section>
          <p>
            Thousands of brain images and terabytes of invaluable associated
            medical data are produced every day at a gigantic pace around the
            world. The Medical Informatics Platform (MIP) aims to federate this
            information and provide the tools to the experts to effectively
            analyse it and advance more rapidly in understanding the
            neurological and psychiatric diseases. This will in turn allow
            identifying the biological changes associated and open real
            possibilities for early diagnosis and personalised medicine.
          </p>
          <p>
            The MIP provides methods to analyse federated data from hospitals,
            research centres and biobanks. Clinical scientists can develop,
            share and release results of their research. The MIP aims to bring
            together people across professional and scientific fields encourages
            them to actively contribute to the design and development of the
            services which the MIP provides.
          </p>
        </section>
        <div>
          <section>
            <h3>The MIP has three main goals:</h3>
            <ul>
              <li>
                Build the tools to federate clinical data, currently
                inaccessible outside hospital and research archives;
              </li>
              <li>
                Recruit hospitals to contribute to and benefit by using the
                platform;
              </li>
              <li>
                Develop tools for extracting biological signatures of diseases
                from multi-level data.
              </li>
            </ul>
          </section>
          <section>
            <h3>You can use the MIP</h3>
            <ul>
              <li>
                as a clinician, for objective diagnoses and treatment of brain
                disease;
              </li>
              <li>
                as a neuroscientist, for the application and testing of new
                models and methods;
              </li>
              <li>
                as a pharmaceutical or biotech company, for disease target
                discovery.
              </li>
            </ul>
          </section>
        </div>
      </Columns>
    </MainBox>
  );
};
