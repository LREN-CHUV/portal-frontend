import React from "react";
import { RingLoader } from "react-spinners";

interface IState {
  loading: boolean;
}


class Loader extends React.Component<IState> {
  public state = { loading: true };

  public render() {
    return (
      <div>
        <RingLoader
          sizeUnit={"px"}
          size={48}
          color={"#0c6c94"}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default Loader;
