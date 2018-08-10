import * as React from "react";

class LoadModel extends React.Component<any> {
  public componentDidMount() {
    const { load, slug } = this.props;
    if (load) {
      load(slug);
    }
  }

  public render() {
    return <React.Fragment />;
  }
}

export default LoadModel;
