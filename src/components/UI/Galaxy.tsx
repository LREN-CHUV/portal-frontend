import React, { useRef } from 'react';
import { AppConfig } from '../App/App';
import styled from 'styled-components';

interface Props {
  appConfig: AppConfig;
}

const IFrameContainer = styled.div`
  width: 100%;
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    position: fixed;
  }
`;

export default React.memo(({ appConfig }: Props) => {
  const divRef = useRef<HTMLIFrameElement>(null);
  const URL = appConfig.galaxyAPIUrl || '';
  const URL_APACHE = appConfig.galaxyApacheUrl || '';

  // const tokenURL = (user = 'nikos', pass = 'koikas') => `${URL}/getToken?user=${user}&pass=${pass}`
  // const authURL = (token) => `${URL}/getBasicAuth?token=${token}`
  const tokenURL = (user = 'nikos', pass = 'koikas'): string =>
    `${URL}/noAuth/getToken?user=${user}&pass=${pass}`;
  const authURL = (token: string) =>
    `${URL}/getGalaxyBasicAccessToken?Authorization=${token}`;

  // Service methods
  const getTokenService = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(`Error token: ${error}`));
    });
  };
  const getAuthService = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      fetch(token)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(`Error auth: ${error}`));
    });
  };
  const getHTML = (auth: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      fetch(URL_APACHE, {
        mode: 'no-cors',
        method: 'GET',
        headers: {
          Authorization: `Basic YWRtaW46cEBzc3cwcmQ=`
        }
      })
        .then(response => response.text())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  };

  getHTML('123')
    .then(result => {
      if (divRef && divRef.current) {
        divRef.current.src = URL_APACHE;
      }
    })
    .catch((error: string) => console.error(`Error html: ${error}`));

  return (
    <IFrameContainer>
      <iframe title="Galaxy Workflow" className="html-iframe" ref={divRef} />
    </IFrameContainer>
  );
});
