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
  noCaret?: boolean
}
export default ({
  items,
  title = "Current Model",
  handleSelect,
  noCaret = false
}: IDropdown) => (
  <DropdownButton noCaret={noCaret} bsStyle="default" id={"experiment-dropdown"} title={title}>
    {items &&
      handleSelect &&
      items
        .sort((a1: IExperimentResult, b1: IExperimentResult) => {
          const a = a1.created;
          const b = b1.created;

          return a > b ? -1 : a < b ? 1 : 0;
        })
        .map((experiment, i: number) => {
          let experimentState;

          experimentState = experiment.error
            ? "glyphicon-exclamation-sign glyph"
            : !experiment.results
              ? "glyphicon-transfer glyph loading"
              : "glyphicon-eye-open glyph";
          experimentState += experiment.resultsViewed
            ? " viewed"
            : " ready"

          return (
            <MenuItem
              eventKey={i}
              key={experiment.uuid}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleSelect(experiment)}
            >
              <span className={experimentState} />
              {"  "}
              <strong>{experiment.name}</strong>
              {" - "}
              {moment(experiment.created, "YYYYMMDD").fromNow()}
            </MenuItem>
          );
        })}
  </DropdownButton>
);
