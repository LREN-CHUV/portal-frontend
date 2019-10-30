import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { APICore } from '../API/';
import { GalaxyConfig } from '../API/Core';
import Error from './Error';

interface Props {
  apiCore: APICore;
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

export default React.memo(({ apiCore }: Props) => {
  const divRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GalaxyConfig>();

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      await apiCore.fetchGalaxyConfiguration();
      const config = apiCore.state.galaxy;
      if (config) {
        if (config.error) {
          setError(config.error);
        }

        setConfig(apiCore.state.galaxy);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config) {
      const { authorization, context } = config;
      if (authorization && context) {
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
    }
  }, [config]);

  return (
    <IFrameContainer>
      {error && <Error message={error} />}
      {<iframe title="Galaxy Workflow" ref={divRef} />}
    </IFrameContainer>
  );
});
