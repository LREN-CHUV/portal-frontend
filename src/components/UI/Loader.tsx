import React from 'react';
import { RingLoader } from 'react-spinners';
import styled from 'styled-components';

const Loader = styled.div`
  display: flex;
  p {
    padding-left: 8px;
    color: cadetblue;
  }
`;

interface Props {
  visible?: boolean;
}
class LoaderComponent extends React.Component<Props> {
  public render(): JSX.Element {
    const { visible } = this.props || true;
    return (
      <Loader>
        <RingLoader
          sizeUnit={'px'}
          size={16}
          color={'#0c6c94'}
          loading={visible}
        />
        <p>loading...</p>
      </Loader>
    );
  }
}

export default LoaderComponent;
