import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import { APICore, APIExperiment, APIModel } from '../API';
import Home from './Home';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;
interface Props extends RouteComponentProps<any> {
//   apiExperiment: APIExperiment;
  apiCore: APICore;
//   apiModel: APIModel;
//   appConfig: any;
}

export default ({ ...props }: Props) => (
  <Layout>
    <Home {...props} />
  </Layout>
);
