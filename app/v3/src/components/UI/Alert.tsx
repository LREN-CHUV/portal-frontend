import * as React from "react";
import { Alert as BSAlert } from "react-bootstrap";

export interface IAlert {
  message: string | undefined;
  style?: string;
  title?: string;
}

export class Alert extends React.Component<IAlert> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return <BSAlert bsStyle={this.props.style || "danger"}>
        <h4>{this.props.title || "Error"}</h4>
        <p>{this.props.message}</p>
      </BSAlert>

  }
}
