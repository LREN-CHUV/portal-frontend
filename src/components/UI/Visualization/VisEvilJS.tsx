import * as React from 'react';

// FIXME: fix that eval
/* eslint-disable-next-line */
const vis = require('vis/dist/vis.min');

interface Props {
  jsString: any;
}

export default class VISJS extends React.PureComponent<Props> {
  public componentDidMount(): void {
    eval(`${this.props.jsString}`);
  }

  public render = (): JSX.Element => (
    <div
      id="visualization"
      style={{
        height: '500px'
      }}
    />
  );
}
