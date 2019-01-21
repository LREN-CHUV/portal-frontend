import React from "react";
import { RingLoader } from "react-spinners";

import "./Loader.css";

class Loader extends React.Component {
  public render() {
    return (
      <div className="loader">
        <RingLoader
          sizeUnit={"px"}
          size={16}
          color={"#0c6c94"}
          loading={true}
        />
        <p>loading data...</p>
      </div>
    );
  }
}

export default Loader;
