import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { AppConfig } from '../App/App';
import Error from './Error';

interface Props {
  appConfig: AppConfig;
  token?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState();
  const URL_APACHE = appConfig.galaxyApacheUrl || '';

  useEffect(() => {
    const fetchToken = async (): Promise<void> => {
      const response = await fetch(
        `http://localhost:8080/services/galaxy/token`
      );
      const data = await response.json();
      const token = data.response;

      setToken(token);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      const Authorization = `Basic ${token}`;
      fetch(URL_APACHE, {
        headers: new Headers({
          Authorization
        })
      })
        .then(() => {
          if (divRef && divRef.current) {
            divRef.current.src = URL_APACHE;
          }
        })
        .catch(error => {
          console.log(error);
          setError(error.message);
        });
    }
  }, token);

  return (
    <IFrameContainer>
      {error && <Error message={error} />}
      {token && <iframe title="Galaxy Workflow" ref={divRef} />}
    </IFrameContainer>
  );
});
