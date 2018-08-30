import * as moment from "moment";
import * as React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { IExperimentResult } from "../types";

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
  <DropdownButton
    bsStyle="default"
    id={"experiment-dropdown"}
    title={title}
  >
    {items &&
      handleSelect &&
      items.sort((a: IExperimentResult, b: IExperimentResult) => a.created < b.created ? 1 : 0).map((experiment, i: number) => (
        // tslint:disable-next-line jsx-no-lambda
        <MenuItem eventKey={i} key={experiment.uuid} onSelect={() => handleSelect(experiment)}>
          {experiment.error? <span>x </span>: null}
          {!experiment.error && !experiment.nodes ? <span>... </span>: null}
          <strong>{experiment.name}</strong>{" - "}{moment(experiment.created, "YYYYMMDD").fromNow()}
        </MenuItem>
      ))}
  </DropdownButton>
);
