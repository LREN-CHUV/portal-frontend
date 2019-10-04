import React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import defaultUser from '../../images/default_user.png';
import { APIUser } from '../API';
import Header from './Header';

const Heading = styled(Panel.Heading)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 0px none transparent;
`;

const Content = styled.div`
  display: flex;
  justify-content: flex-start;

  .panel {
    padding: 1em;
  }

  .panel:first-child {
    flex: 0;
    margin-right: 8px;
  }

  .panel:last-child {
    flex: 1;
  }
`;

const User = styled.img`
  max-width: 120px;
`;

const Submit = styled.div`
  text-align: right;
`;

interface Props extends RouteComponentProps<{}> {
  apiUser: APIUser;
}

export default ({ apiUser }: Props): JSX.Element => {
  const user = apiUser.state && apiUser.state.user;

  return (
    <>
      <Header />
      <Content>
        <Panel>
          <User
            className="img-circle"
            src={defaultUser}
            alt={user && user.username}
          />
          <h3>{user && user.username}</h3>
        </Panel>
        <Panel>
          <Heading>Infos</Heading>
          <Panel.Body>
            <div className="form-group">
              <label className="control-label">Username:</label>
              <input
                className="form-control"
                type="text"
                name="username"
                disabled={true}
                defaultValue={user && user.username}
              />
            </div>
            <div className="form-group">
              <label className="control-label">Full Name:</label>
              <input
                className="form-control"
                type="text"
                name="fullname"
                disabled={true}
                defaultValue={user && user.fullname}
              />
            </div>
            <div className="form-group">
              <label className="control-label">Email:</label>
              <input
                className="form-control"
                type="text"
                name="lastName"
                disabled={true}
                defaultValue={user && user.email}
              />
            </div>
            <Submit>
              <button className="btn-info btn" disabled={true}>
                Save
              </button>
              <button className="btn-default btn" disabled={true}>
                Reset
              </button>
            </Submit>
          </Panel.Body>
        </Panel>
      </Content>
    </>
  );
};
