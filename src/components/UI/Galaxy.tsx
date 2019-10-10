import React, { useRef, useState } from 'react';
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

export default React.memo(
  ({ appConfig, token = 'Basic YWRtaW46cEBzc3cwcmQ=' }: Props) => {
    const divRef = useRef<HTMLIFrameElement>(null);
    const [error, setError] = useState<string | null>(null);

    const URL_APACHE = appConfig.galaxyApacheUrl || '';
    fetch(URL_APACHE, {
      headers: new Headers({
        Authorization: `${token}`
      })
    })
      .then(() => {
        if (divRef && divRef.current) {
          divRef.current.src = URL_APACHE;
        }
      })
      .catch(error => {
        setError(error.message);
      });

    return (
      <IFrameContainer>
        {error && <Error message={error} />}
        {!error && <iframe title="Galaxy Workflow" ref={divRef} />}
      </IFrameContainer>
    );
  }
);
