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
  const [authorization, setAuthorization] = useState();
  const [context, setContext] = useState();

  useEffect(() => {
    const fetchToken = async (): Promise<void> => {
      const response = await fetch(`http://localhost:8080/services/galaxy`);
      const data = await response.json();
      setAuthorization(data.authorization);
      setContext(data.context);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (authorization) {
      fetch(context, {
        headers: new Headers({
          Authorization: authorization
        })
      })
        .then(() => {
          if (divRef && divRef.current) {
            divRef.current.src = context;
          }
        })
        .catch(error => {
          console.log(error);
          setError(error.message);
        });
    }
  }, [authorization, context]);

  return (
    <IFrameContainer>
      {error && <Error message={error} />}
      {authorization && context && (
        <iframe title="Galaxy Workflow" ref={divRef} />
      )}
    </IFrameContainer>
  );
});
