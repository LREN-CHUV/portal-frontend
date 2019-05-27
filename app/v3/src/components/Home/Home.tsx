import React from 'react';
import styled from 'styled-components';

import Infos from './Infos';
import Model from './Model';
import { APICore, APIExperiment, APIModel } from '../API';

const Models = styled.div`
  display: flex;
  justify-content: flex-start;
`;

interface Props {
  //   apiExperiment: APIExperiment;
    apiCore: APICore;
  //   apiModel: APIModel;
  //   appConfig: any;
  }

export default ({ ...props }: Props) => {
  const { apiCore } = props;
  return (
    <>
      <Infos stats={apiCore.state.stats} />
      <Models>
        <Model />
        <Model />
        <Model />
      </Models>
    </>
  );
};
