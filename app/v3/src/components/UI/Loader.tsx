import React from "react";
import { RingLoader } from "react-spinners";


class Loader extends React.Component {

  public render() {
    return (
      <div>
        <RingLoader
          sizeUnit={"px"}
          size={16}
          color={"#0c6c94"}
          loading={true}
        />
      </div>
    );
  }
}

export default Loader;
