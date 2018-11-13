import * as React from "react";
import { Alert } from "react-bootstrap";

interface IProps {
  message: string;
  show: boolean;
  style?: string;
  title?: string;
}

class AlertDismissable extends React.Component<IProps> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return this.props.show ? (
      <Alert bsStyle={this.props.style || "danger"}>
        <h4>{this.props.title || "Error"}</h4>
        <p>{this.props.message}</p>
      </Alert>
    ) : null;
  }
}

export default AlertDismissable;
