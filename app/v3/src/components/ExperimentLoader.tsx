import * as React from "react";

class LoadExperiment extends React.Component<any> {
  public componentDidMount() {
    const { load, uuid } = this.props;
    if (load) {
      load(uuid);
    }
  }

  public render() {
    return <React.Fragment />;
  }
}

export default LoadExperiment;
