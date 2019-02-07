import React from "react";
import { RingLoader } from "react-spinners";

import "./Loader.css";

interface IProps {
  visible?: boolean;
}
class Loader extends React.Component<IProps> {
  public render() {
    const { visible } = this.props || true;
    return (
      <div className="loader">
        <RingLoader
          sizeUnit={"px"}
          size={16}
          color={"#0c6c94"}
          loading={visible}
        />
        <p className={visible ? "" : "hidden"}>loading data...</p>
      </div>
    );
  }
}

export default Loader;
