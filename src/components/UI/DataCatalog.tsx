import React, { useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';

const IFrameContainer = styled.div`
  width: 100%;
  height: 100%;

  iframe {
    width: calc(100% - 16px);
    height: calc(100% - 88px);
    border: 0;
    position: fixed;
  }
`;

const AlertBox = styled(Alert)`
  position: relative;
  margin: 16px;
`;

export default React.memo(() => {
  const divRef = useRef<HTMLIFrameElement>(null);
  const [error] = useState<string | null>(null);

  return (
    <IFrameContainer>
      {error && (
        <AlertBox bsStyle="danger">
          <strong>There was an error</strong> {error}
        </AlertBox>
      )}
      <iframe title="Galaxy Workflow" ref={divRef} src="/datacatalogue" />
    </IFrameContainer>
  );
});
