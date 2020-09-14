import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import defaultUser from '../../images/default_user.png';
import { APIUser } from '../API';
import Header from './Header';

const Heading = styled(Card.Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0px none transparent;
`;

const Content = styled.div`
  display: flex;
  justify-content: flex-start;

  .card {
    padding: 1em;
    min-width: 360px;
  }

  .card:first-child {
    flex: 0;
    margin-right: 8px;
  }

  .card:last-child {
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
        <Card>
          <User
            className="img-circle"
            src={defaultUser}
            alt={user && user.username}
          />
          <h3>{user && user.username}</h3>
        </Card>
        <Card>
          <Heading>
            <h2>Infos</h2>
            <Button
              variant={'warning'}
              onClick={(): void => {
                apiUser.logout();
                window.location.href = '/';
              }}
            >
              Logout
            </Button>
          </Heading>
          <Card.Body>
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
          </Card.Body>
        </Card>
      </Content>
    </>
  );
};
