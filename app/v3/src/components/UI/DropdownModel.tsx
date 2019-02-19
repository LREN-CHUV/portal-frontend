import { MIP } from "../../types";
import * as React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import "./Dropdown.css";

interface IDropdown {
  items: MIP.API.IModelResponse[] | undefined;
  title?: string;
  handleSelect: any;
  noCaret?: boolean;
}
export default ({
  items,
  title = "No Model",
  handleSelect,
  noCaret = false
}: IDropdown) => (
  <DropdownButton
    noCaret={noCaret}
    bsSize="small"
    id={"model-dropdown"}
    title={title}
  >
    {items &&
      handleSelect &&
      items.map((item, i: number) => {
        return (
          <MenuItem
            eventKey={i}
            key={item.title}
            // tslint:disable-next-line jsx-no-lambda
            onSelect={() => handleSelect(item)}
          >
            <strong>{item.title}</strong>
          </MenuItem>
        );
      })}
  </DropdownButton>
);
