// tslint:disable:no-console
import * as moment from "moment";
import * as React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { IExperimentResult } from "../types";

import "./Dropdown.css";
interface IDropdown {
  items: IExperimentResult[] | undefined;
  title: string;
  handleSelect: any;
}
export default ({
  items,
  title = "Current Model",
  handleSelect
}: IDropdown) => (
  <DropdownButton bsStyle="default" id={"experiment-dropdown"} title={title}>
    {items &&
      handleSelect &&
      items
        .sort((a1: IExperimentResult, b1: IExperimentResult) => {
          const a = a1.created;
          const b = b1.created;

          return a > b ? -1 : a < b ? 1 : 0;
        })
        .map((experiment, i: number) => (
          <MenuItem
            eventKey={i}
            key={experiment.uuid}
            // tslint:disable-next-line jsx-no-lambda
            onSelect={() => handleSelect(experiment)}
          >
            {experiment.error ? (
              <span className={"glyphicon-exclamation-sign glyph viewed"} />
            ) : !experiment.result ? (
              <span className={"glyphicon-transfer glyph info"} />
            ) : experiment.resultsViewed ? (
              <span className={"glyphicon-eye-open glyph viewed"} />
            ) : (
              <span className={"glyphicon-eye-open glyph success"} />
            )}
            {"  "}
            <strong>{experiment.name}</strong>
            {" - "}
            {moment(experiment.created, "YYYYMMDD").fromNow()}
          </MenuItem>
        ))}
  </DropdownButton>
);
