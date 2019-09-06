import React from 'react';
import { RingLoader } from 'react-spinners';

import './Loader.css';

interface Props {
  visible?: boolean;
}
class Loader extends React.Component<Props> {
  public render() {
    const { visible } = this.props || true;
    return (
      <div className="loader">
        <RingLoader
          sizeUnit={'px'}
          size={16}
          color={'#0c6c94'}
          loading={visible}
        />
        <p>loading...</p>
      </div>
    );
  }
}

export default Loader;
