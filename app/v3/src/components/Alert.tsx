import * as React from "react";
import { Alert } from "react-bootstrap";

interface IProps {
  message: string;
  show: boolean;
}

class AlertDismissable extends React.Component<IProps> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return this.props.show ? (
      <Alert bsStyle="danger">
        <h4>There was an error</h4>
        <p>{this.props.message}</p>
      </Alert>
    ) : null;
  }
}

export default AlertDismissable;
