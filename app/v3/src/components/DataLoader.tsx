import * as React from "react";

class LoadData extends React.Component<any> {
  public state = {
    id: undefined,
    load: undefined
  };

  public componentDidMount() {
    const { load, id } = this.props;
    if (load) {
      this.setState({ load, id });
      load(id);
    }
  }

  public componentDidUpdate() {
    const { load, id } = this.props;
    if (id !== this.state.id) {
      this.setState({ load, id });
      load(id);
    }
  }

  public render() {
    return <React.Fragment />;
  }
}

export default LoadData;
