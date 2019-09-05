import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import default_user from '../../images/default_user.png';
import { APIUser } from '../API';
import Header from './Header';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 33% 66%;
  grid-column-gap: 8px;
`;

const StyledPanel = styled(Panel)`
  margin: 0 auto;
`;

const CenteredPanel = styled(Panel)`
  padding: 1em !important;
  text-align: center;
`;

const Heading = styled(Panel.Heading)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 0px none transparent;
`;

const PanelBody = styled(Panel.Body)`
  p {
    margin: 0;
  }
`;

const User = styled.img`
  max-width: 160px;
`;

const Submit = styled.div`
  text-align: right;
`;

interface Props extends RouteComponentProps<{}> {
  apiUser: APIUser;
}

export default ({ apiUser }: Props) => {
  const user = apiUser.state && apiUser.state.user;

  return (
    <>
      <Layout>
        <Header />
        {user && (
          <GridLayout>
            <CenteredPanel>
              <User
                className='img-circle'
                src={default_user}
                alt={user.username}
              />
              <h3>{user.username}</h3>
            </CenteredPanel>
            <StyledPanel>
              <Heading>Infos</Heading>
              <PanelBody>
                <div className='form-group'>
                  <label className='control-label'>Username:</label>
                  <input
                    className='form-control'
                    type='text'
                    name='username'
                    disabled={true}
                    defaultValue={user.username}
                  />
                </div>
                <div className='form-group'>
                  <label className='control-label'>Full Name:</label>
                  <input
                    className='form-control'
                    type='text'
                    name='fullname'
                    disabled={true}
                    defaultValue={user.fullname}
                  />
                </div>
                <div className='form-group'>
                  <label className='control-label'>Email:</label>
                  <input
                    className='form-control'
                    type='text'
                    name='lastName'
                    disabled={true}
                    defaultValue={user.email}
                  />
                </div>
                <Submit>
                  <button className='btn-info btn' disabled={true}>
                    Save
                  </button>
                  <button className='btn-default btn' disabled={true}>
                    Reset
                  </button>
                </Submit>
              </PanelBody>
            </StyledPanel>
          </GridLayout>
        )}
      </Layout>
    </>
  );
};
