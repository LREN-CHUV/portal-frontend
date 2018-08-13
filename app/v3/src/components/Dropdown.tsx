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
    bsSize="small"
    id={"dropdown-basic"}
    title={title}
  >
    {items &&
      handleSelect &&
      items.map((m, i: number) => (
        // tslint:disable-next-line jsx-no-lambda
        <MenuItem eventKey={i} key={m.uuid} onSelect={() => handleSelect(m)}>
          {m.name}
        </MenuItem>
      ))}
  </DropdownButton>
);
