import * as React from "react";
import { Alert as BSAlert } from "react-bootstrap";

export interface IAlert {
  message?: string;
  style?: string;
  title?: string;
}

export const Alert = ({ message, style, title }: IAlert) =>
  (message && (
    <BSAlert bsStyle={style || "danger"}>
      <h4>{title || "Error"}</h4>
      <p>{message}</p>
    </BSAlert>
  )) ||
  null;
