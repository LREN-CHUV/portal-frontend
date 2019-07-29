import React from 'react';
import { Button, DropdownButton, MenuItem, Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import default_user from '../../images/default_user.png';
import { APIUser } from '../API';

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

interface Props extends RouteComponentProps<{}> {
  apiUser: APIUser;
}

// {
//     "username": "manu",
//     "fullname": "Manuel Spuhler",
//     "firstname": "Manuel",
//     "lastname": "Spuhler",
//     "picture": "images/users/default_user.png",
//     "email": "guy.spuhler@chuv.ch",
//     "languages": [],
//     "roles": [],
//     "agreeNDA": true,
//     "votedApps": []
//   }

export default ({ apiUser }: Props) => {
  const user = apiUser.state && apiUser.state.user;

  return (
    <>
      {user && (
        <Layout>
          <GridLayout>
            <CenteredPanel>
              <User className='img-circle' src={default_user} alt={user.name} />
              <h2>{user.name}</h2>
            </CenteredPanel>
            <StyledPanel>
              <Heading>Infos</Heading>
              <PanelBody>
                <div className='form-group'>
                  <label className='control-label'>Username:</label>
                  <input className='form-control' type='text' name='username' />
                </div>
                <div className='form-group'>
                  <label className='control-label'>First Name:</label>
                  <input
                    className='form-control'
                    type='text'
                    name='firstname'
                  />
                </div>
                <div className='form-group'>
                  <label className='control-label'>Last Name:</label>
                  <input className='form-control' type='text' name='lastName' />
                </div>
                <div>
                  <button className='btn-primary btn'>Save</button>
                  <button className='btn-default btn'>Reset</button>
                </div>
              </PanelBody>
            </StyledPanel>
          </GridLayout>
        </Layout>
      )}
    </>
  );
};
