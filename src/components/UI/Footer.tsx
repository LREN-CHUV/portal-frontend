import * as React from 'react';
import { AppConfig, InstanceMode } from '../App/App';
import styled from 'styled-components';
import ChuvLogo from '../../images/logo_chuv.png';

const FooterBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items; center;
  padding: 0 16px;
  background: #000000cc;
  color: white;
  height: 31px;

  span {
    display: flex;
  }

  div {
    background: url(${ChuvLogo}) left center no-repeat;
    width: 59px;
    height: 31px;
    margin-right: 16px;
  }

  position:fixed;
   left:0px;
   bottom:0px;
   height:30px;
   width:100%;

`;

export default ({ appConfig }: { appConfig: AppConfig }): JSX.Element => (
  <FooterBox>
    <span>
      <div title="CHUV Lausanne"></div>
      <h6>
        © 2015-2020{' '}
        <a
          href="https://www.humanbrainproject.eu/en/"
          title="The Human Brain Project Website"
        >
          Human Brain Project{' '}
        </a>
        . All right reserved
      </h6>
    </span>
    <h6>
      {appConfig.version}
      {appConfig.version ? ' | ' : ''}Mode:{' '}
      {appConfig.mode === InstanceMode.Local ? 'Local' : 'Federation'}
    </h6>
  </FooterBox>
);
