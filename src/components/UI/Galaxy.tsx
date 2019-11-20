import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { APICore } from '../API/';
import { GalaxyConfig } from '../API/Core';
import Error from './Error';
import { Base64 } from 'js-base64';

interface Props {
  apiCore: APICore;
}

const IFrameContainer = styled.div`
  width: 100%;
  height: 100%;

  iframe {
    width: calc(100% - 96px);
    height: calc(100% - 88px);
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
  }, [apiCore]);

  useEffect(() => {
    if (config) {
      const { authorization, context } = config;
      if (authorization && context) {
        const req = new XMLHttpRequest();
        const [user, password] = Base64.decode(authorization).split(':');
        req.open('POST', context, false, user, password);
        req.send(null);
        if (divRef && divRef.current) {
          divRef.current.src = context;
        }
      }
    }
  }, [config]);

  return (
    <IFrameContainer>
      {error && <Error message={error} />}
      <iframe title="Galaxy Workflow" ref={divRef} />
    </IFrameContainer>
  );
});
