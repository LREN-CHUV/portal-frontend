import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

const Title = styled.h3`
  margin: 16px 0;
`;

const Videos = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const Video = styled.iframe`
  margin: 0 16px 32px 0;
`;

export default (): JSX.Element => (
  <>
    <Panel>
      <Panel.Title>
        <Title>Training</Title>
      </Panel.Title>
    </Panel>
    <Panel>
      <Panel.Body>
        <article>
          <Videos>
            <Video
              title="01 First steps in the MIP"
              src="https://player.vimeo.com/video/387925204"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="02 How to select variables"
              src="https://player.vimeo.com/video/387925216"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>
            <Video
              title="03 How to analyse the variables"
              src="https://player.vimeo.com/video/387925238"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="04 How to filter and save a variable"
              src="https://player.vimeo.com/video/387925256"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="05 How to perform an independent T-Test"
              src="https://player.vimeo.com/video/387925276"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="06 How to perform ANOVA"
              src="https://player.vimeo.com/video/387926320"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="07 How to perform a linear regression"
              src="https://player.vimeo.com/video/387926353"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>

            <Video
              title="09 How to perform pearson correlation"
              src="https://player.vimeo.com/video/387926382"
              width="640"
              height="360"
              allow="autoplay; fullscreen"
            ></Video>
          </Videos>
        </article>
      </Panel.Body>
    </Panel>
  </>
);
