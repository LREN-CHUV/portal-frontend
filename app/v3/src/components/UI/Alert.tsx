import * as React from "react";
import { Alert as BSAlert } from "react-bootstrap";

export interface IAlert {
  message?: string;
  styled?: string;
  title?: string;
}

export const Alert = ({ message, styled, title }: IAlert) =>
  (message && (
    <BSAlert bsStyle={styled || "danger"}>
      <h4>{title || "Error"}</h4>
      <p>{message}</p>
    </BSAlert>
  )) ||
  null;
