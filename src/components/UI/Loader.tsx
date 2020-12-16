import React from 'react';
import { RingLoader } from 'react-spinners';
import styled from 'styled-components';

const Loader = styled.div`
  display: flex;
  align-content: center;
  p {
    padding-left: 8px;
    color: #17a2b8;
  }
`;

interface Props {
  visible?: boolean;
}
class LoaderComponent extends React.Component<Props> {
  render(): JSX.Element {
    const { visible } = this.props || true;
    return (
      <Loader>
        <RingLoader
          sizeUnit={'px'}
          size={16}
          color={'#17a2b8'}
          loading={visible}
        />
        <p>loading...</p>
      </Loader>
    );
  }
}

export default LoaderComponent;
