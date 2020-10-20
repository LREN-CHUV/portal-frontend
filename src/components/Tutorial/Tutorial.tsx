import * as React from 'react';
import { Button, Carousel, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import MIPContext from '../App/MIPContext';
import start from './0.png';
import one from './1.png';
import two from './2.png';
import three from './3.png';
import four from './4.png';
import five from './5.png';
import six from './6.png';
import seven from './7.png';
import eight from './7.png';
import nine from './7.png';
import ten from './7.png';
import eleven from './7.png';

const Title = styled.h3`
  color: black;
`;

const Text = styled.p`
  color: black;
`;

export default (): JSX.Element => {
  const [width, height] = [1200, 675];
  const slides = [
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    eight,
    nine,
    ten,
    eleven
  ];

  return (
    <div className="static-modal">
      <Modal.Dialog>
        <Modal.Body>
          <Carousel>
            <Carousel.Item>
              <img width={width} height={height} alt="Variables" src={start} />
              <Carousel.Caption>
                <Text>
                  Basic skills to start working with the MIP and conduct initial
                  experiments
                </Text>
              </Carousel.Caption>
            </Carousel.Item>

            {slides.map((s, i) => (
              <Carousel.Item key={`slide-${i}`}>
                <img width={width} height={height} alt="Variables" src={s} />
              </Carousel.Item>
            ))}

            <Carousel.Item>
              <img width={width} height={height} alt="Variables" src={start} />
              <Carousel.Caption>
                <Title>More ?</Title>
                <Text>You can watch the videos </Text>
                <Text>
                  Document created based on{' '}
                  <Link to="/training"> MIP video tutorials</Link>
                </Text>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Modal.Body>
        <Modal.Footer>
          <MIPContext.Consumer>
            {({ toggleTutorial }): JSX.Element =>
              (
                <Button bsStyle="warning" onClick={toggleTutorial}>
                  Close
                </Button>
              ) || <></>
            }
          </MIPContext.Consumer>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
};
