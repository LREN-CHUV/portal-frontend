import * as React from 'react';
import { Alert, Button } from 'react-bootstrap';
import styled from 'styled-components';

import HBPLogo from '../../images/hbp_logo_135.png';
import HelpButton from './HelpButton';

const ContentBox = styled.div`
  min-height: 100vh;
  background: rgb(36, 36, 36);
  background: radial-gradient(
    circle,
    rgba(36, 36, 36, 1) 0%,
    rgba(51, 51, 51, 1) 32%,
    rgba(34, 34, 34, 1) 100%
  );

  display: flex;
  flex-direction: column;

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
    margin-bottom: 32px;
  }

  h1 {
    text-align: center;
    margin-bottom: 32px;
  }

  .dropdown-menu {
    left: 0 !important;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
  margin: 16px;
`;

const AlertBox = styled(Alert)`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 800px;
`;

const LoginBox = styled.div`
  display: flex;
  flex-direction: column;

  button {
    flex: 1 0 0%;
    min-height: 34px;
    margin-bottom: 1rem;
  }
`;

const Columns = styled.div`
  display: flex;
  padding: 0 10%;
  overflow: auto;

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

const Logo = styled.img`
  width: 135px;
  height: 135px;
  display: block;
  margin: 16px auto 32px auto;
`;

export default ({ login }: { login: () => void }): JSX.Element => (
  <ContentBox>
    <ActionBar>
      <div style={{ left: 100 }}>
        <HelpButton />
      </div>
      <LoginBox>
        <Button onClick={login} variant={'info'} type="submit">
          Login
        </Button>
        <p>
          <a href="https://mip.ebrains.eu/access">Request Access</a>
        </p>
      </LoginBox>
    </ActionBar>
    <main>
      <Logo alt="HBP logo" title={'Human Brain Project'} src={HBPLogo} />
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
    </main>
  </ContentBox>
);
