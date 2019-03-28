import React, { Component } from 'react';
import { APICore } from '../API';
import CirclePack from './CirclePack';

interface IProps {
  apiCore: APICore;
}
class Container extends Component<IProps> {
  public render = () => (
    <svg>
      <CirclePack y={10} />
    </svg>
  );
}

export default Container;
